require('dotenv').config();
const fs = require('fs');
const { parse } = require("csv-parse");
const moment = require('moment');
const axios = require('axios');
const cheerio = require('cheerio');
const helperFn = require('../utils/helperFn');
const puppeteer = require('puppeteer');
const {RESPONSE} = require('../constants/constants');
const { MongoClient } = require('mongodb');
var ProgressBar = require('progress');
const {
  crawPageFapello,dataPageFapello
} = require('../utils/crawlPage');
const https = require('https')
const VideoModel = require('../models/video');

const today = moment().toDate();

const instance = axios.create({
  timeout: 180000, //optional
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {'Content-Type':'application/xml'}
})

const websitesToCrawl = [
  {
    websiteURL: 'https://fapello.com/raelilblack/',
    tagToCrawl: 'div#content div a',
  },
];

async function crawlPage(url) {

  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // let previousHeight;
  // let currentHeight = 0;
  // Scroll until no more content is loaded
  // while (previousHeight !== currentHeight) {
  //   previousHeight = currentHeight;
  //   currentHeight = await page.evaluate(() => {
  //     window.scrollTo(0, document.body.scrollHeight);
  //     return document.body.scrollHeight;
  //   });

    // Wait for a short duration to let content load
  //   await page.waitForTimeout444

  const links = await page.evaluate((url, today,crawPageFapello) => {
    const links = [];
    document.querySelectorAll('div#content div a').forEach((element) => {
      const href = element.getAttribute('href');
      const title = 'Rae Lil Black';
      links.push({
        source: url,
        href,
        title,
        date: today,
      });
    });

    return links;
  }, url, today);

  await browser.close();

  return links;
}

async function listVideos(websites) {
  const results = [];

  for (const { websiteURL } of websites) {
    try {
      const clipLinks = await crawlPage(websiteURL);
      results.push(...clipLinks);
    } catch (error) {
      console.error('Error during crawling:', error);
    }
  }

  return results;
}

async function convertName(url) {
  const path = new URL(url).pathname;
  const pathParts = path.split('/').filter(Boolean);
  const filename = pathParts[pathParts.length - 1];
  return filename;
}

async function crawlData(links) {
  const data = [];
  try {
    for (const link of links) {
      const response = await instance.get(link.href);
      const $ = cheerio.load(response.data);
      $('a.uk-align-center img').each(async (imgIndex, element) => {
        const href = $(element).attr('src');
        const title = await convertName(href);
        data.push({
          source: link.source,
          href,
          title: title,
          date: today,
        });
      });
    }
    console.log("Total new data:", data.length);
    return data;
  } catch (error) {
    console.error('Error during crawling:', error);
  }
}



async function saveImage(links) {
  try {
    for (const link of links) {
        // const imagePath = `Resource/Fapello/${link.title}/${name}`;
        const imagePath = `Resource/Fapello/test/${link.title}`;
        
        // Fetch image data using Axios
        const response = await instance.get(link.href, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        fs.writeFileSync(imagePath, buffer);
        console.log("Images saved successfully:" ,link.title);
    }
    console.log(`Done crawl all image. Happy Coding!`)
    return `Done crawl all image. Happy Coding!`;
  } catch (error) {
    console.error('Error saving image:', error);
  }
}




async function storeNewDifference(clipLinks) {
  const client = new MongoClient(process.env.MONGO_URI);
  try{
    
    const database = client.db('onlyfansleak'); // Specify the database name
    const collection = database.collection('data'); // Specify the collection name
    const videos = clipLinks.map(clipLink => new VideoModel({
      source: clipLink.source,
      href: clipLink.href,
      title: clipLink.title,
      date: clipLink.date,
    }));

    // Use insertMany for bulk insert
    await collection.insertMany(videos);
  
    console.log('Data has been written to the Database');
  }catch (error) {
    console.error('Error saving data to Database:', error);
  }
  
}


async function readExistingData() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();

    const database = client.db('onlyfansleak'); // Specify the database name
    const collection = database.collection('data'); // Specify the collection name

    // Query all data from the collection
    const result = await collection.find({}).toArray();
    console.log('Total existing data:', result.length);
    return result;
  }catch (err) {
    console.error('Error reading videos:', err);
    throw err; // Re-throw the error to be caught by the calling code
  } finally {
    await client.close();
  }
}


function findDifferences(newData, existingData) {
  const differences = [];
  let index = 0;

   // Iterate through new records
   for (const newRecord of newData) {
    
    // Check if there is a record with the same href in existing records
    const existingRecord = existingData.find(
      (record) => {
        return record.href === newRecord.href
      }
    );

    // If not found, add it to the differences
    if (!existingRecord) {
      differences.push(newRecord);
      index++;
    }
  }
  console.log("Total new video:", differences.length);
  if (differences.length !== 30) {
    console.log("Mismatch! Differences array:", differences.length);
  }
  return differences;
}


async function deleteOldVideos() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    const database = client.db('onlyfansleak'); // Specify the database name
    const collection = database.collection('data'); // Specify the collection name
    const fiveDaysAgo = moment().subtract(5, 'days').toDate();
    const now = moment().toDate();
    const result = await collection.deleteMany({ date: { $lt: now} });

    return result;
  } catch (error) {
    console.error('Error deleting old videos:', error);
    throw error;
  }
}


const updateNewVideo = async (req) => {
  try {
    const newListData = await listVideos(websitesToCrawl);
    const newData = await crawlData(newListData);
    const existingData = await readExistingData();
    const difference = findDifferences(newData, existingData)
    
    // If there are differences, send an email and write the new data to the CSV file
    if (difference.length > 0) {
      // helperFn.sendEmail(difference);
      saveImage(difference);
      storeNewDifference(difference);
      deleteOldVideos();
      return RESPONSE.SEND_EMAIL_SUCCESSFULLY;
    }else {
      // helperFn.sendEmail('No new video');
      deleteOldVideos();
      return RESPONSE.SEND_EMAIL_SUCCESSFULLY;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};


const getVideos = async (req) => {
  const videos = await VideoModel.find({}).exec();
  helperFn.sendEmail(videos);
  if(videos.length === 0) return RESPONSE.NO_VIDEO;
  return videos;
};

module.exports = {
  updateNewVideo, getVideos
}