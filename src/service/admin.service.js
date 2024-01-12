require('dotenv').config();
const fs = require('fs');
const { parse } = require("csv-parse");
const moment = require('moment');
const axios = require('axios');
const cheerio = require('cheerio');
const helperFn = require('../utils/helperFn');
const puppeteer = require('puppeteer');
const {RESPONSE} = require('../constants/constants');
const { createProgressBar, updateProgressBar, terminateProgressBar } = require('../utils/progressBarUtil');
const https = require('https')
const PostModel = require('../models/post');

const today = moment().toDate();

const instance = axios.create({
  timeout: 180000, //optional
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {'Content-Type':'application/xml'}
})

const websitesToCrawl = [
  {
    source: 'https://fapello.com/raelilblack/',
    nameSite: 'fapello',
    nameActor: 'Rae Lil Black',
    tagToCrawl: 'div#content div a',
    tagToCrawlSinglePost: 'a.uk-align-center img',
  },
  {
    source: 'https://fapello.com/gabbie-carter-1/',
    nameSite: 'fapello',
    nameActor: 'Gabbie Carter',
    tagToCrawl: 'div#content div a',
    tagToCrawlSinglePost: 'a.uk-align-center img',
  },

];

async function crawlPage(website) {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();

  await page.goto(website.source, { waitUntil: 'domcontentloaded' });

  let previousHeight;
  let currentHeight = 0;
  // Scroll until no more content is loaded
  // while (previousHeight !== currentHeight) {
  //   previousHeight = currentHeight;
  //   currentHeight = await page.evaluate(() => {
  //     window.scrollTo(0, document.body.scrollHeight);
  //     return document.body.scrollHeight;
  //   });

  //   // Wait for a short duration to let content load
  //   await page.waitForTimeout(1000);
  // }
  const links = await page.evaluate(( today, website) => {
    const links = [];
    document.querySelectorAll(website.tagToCrawl).forEach((element) => {
      const href = element.getAttribute('href');
      links.push({
        source: website.source,
        href,
        nameSite: website.nameSite,
        nameActor: website.nameActor,
        date: today,
      });
    });

    return links;
  }, today, website);

  await browser.close();

  return links;
}

async function listVideos(websites) {
  const results = [];

  for (const  website  of websites) {
    try {
      const clipLinks = await crawlPage(website);
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
        const nameFile = await convertName(href);
        data.push({
          source: link.source,
          href,
          nameSite: link.nameSite,
          nameActor: link.nameActor,
          nameFile,
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



async function saveImage(links,progressBarArray) {
  try {
    for (let i = 0; i < links.length; i++) {
      const link = links[i];

        const imagePath = `Resource/${link.nameSite}/${link.nameActor}/${link.nameFile}`;
        // const imagePath = `Resource/Fapello/test/${link.title}`;
        helperFn.createFolderStructureIfNotExists(imagePath);
        // Create a new progress bar for each image
        progressBarArray[i] = createProgressBar(link.nameFile, 100);
        
        // Fetch image data using Axios
      const response = await axios.get(link.href, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          // Update the individual progress bar for each image
          updateProgressBar(progressBarArray[i], progressEvent);
        },
      });
        const buffer = Buffer.from(response.data, 'binary');
        fs.writeFileSync(imagePath, buffer);
        terminateProgressBar(progressBarArray[i]);
    }
    console.log(`Done crawl all image. Happy Coding!`)
    return `Done crawl all image. Happy Coding!`;
  } catch (error) {
    console.error('Error saving image:', error);
  }
}




async function storeNewDifference(clipLinks) {
  try{
    const posts = clipLinks.map(clipLink => ({
      source: clipLink.source,
      href: clipLink.href,
      nameSite: clipLink.nameSite,
      nameActor: clipLink.nameActor,
      nameFile: clipLink.nameFile,
      date: clipLink.date,
    }));

    // Use create for bulk insert using Mongoose model
    await PostModel.create(posts);
  
    console.log('Data has been written to the Database');
  }catch (error) {
    console.error('Error saving data to Database:', error);
    throw error;
  }
}

async function deleteNewVideos(clipLinks) {

  try {

    const hrefValues = clipLinks.map(clipLink => clipLink.href);

    // Delete documents where the href is in the array
    const result = await PostModel.deleteMany({ href: { $in: hrefValues } });

    return result;
  } catch (error) {
    console.error('Error deleting old videos:', error);
    throw error;
  }
}


async function readExistingData() {
  try {
    const result = await PostModel.find({});
    console.log('Total existing data:', result.length);
    return result;
  }catch (err) {
    console.error('Error reading videos:', err);
    throw err; // Re-throw the error to be caught by the calling code
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
  try {
    const fiveDaysAgo = moment().subtract(5, 'days').toDate();
    // const now = moment().toDate();
    const result = await PostModel.deleteMany({ date: { $lt: fiveDaysAgo} });

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
    // Create an array to store individual progress bars
    const progressBarArray = Array.from({ length: difference.length });
    // // If there are differences, send an email and write the new data to the CSV file
    if (difference.length > 0) {
      try {
        // helperFn.sendEmail(difference);
        await saveImage(difference,progressBarArray);
        await storeNewDifference(difference);
        await deleteOldVideos();
        // return RESPONSE.SEND_EMAIL_SUCCESSFULLY;
      }catch(error) {
        // rollback logic
        deleteNewVideos(difference);
        throw error;
      }
    }else {
    //   // helperFn.sendEmail('No new video');
    //   deleteOldVideos();
    //   return RESPONSE.SEND_EMAIL_SUCCESSFULLY;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};


const getVideos = async (req) => {
  const videos = await PostModel.find({}).exec();
  helperFn.sendEmail(videos);
  if(videos.length === 0) return RESPONSE.NO_VIDEO;
  return videos;
};

module.exports = {
  updateNewVideo, getVideos
}