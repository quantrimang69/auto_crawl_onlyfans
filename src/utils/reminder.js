require('dotenv').config();
const axios = require('axios');

const reminder = async () => {
  console.log('Running script to update new video at', new Date());
  try {
    // Make the API call
    const response = await axios.get(process.env.API_GET_UPDATE_VIDEO);
    console.log('API response:', response.data);
  } catch (error) {
    console.error('Error calling API:', error.message);
  }
};

module.exports = reminder;
