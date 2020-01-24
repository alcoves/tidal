const axios = require('axios');
const logger = require('./logger');

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.bken.io'
    : 'http://localhost:3000';

module.exports.uploadThumbnail = async (videoId, thumbnail) => {
  await axios({
    method: 'post',
    url: `/videos/${videoId}`,
    data: { thumbnail },
    headers: { authorization: process.env.CONVERSION_API_KEY },
  });
};

module.exports.getVideo = async (videoId) => {
  await axios({
    method: 'get',
    url: `/videos/${videoId}`,
    headers: { authorization: process.env.CONVERSION_API_KEY },
  });
};

module.exports = async (config) => {
  try {
    config.headers = {
      authorization: process.env.CONVERSION_API_KEY,
      'Content-Type': 'application/json',
    };
    config.url = `${baseUrl}${config.url}`;
    const loggingSafeConfig = { ...config, headers: 'sanitized' };
    logger.info(JSON.stringify(loggingSafeConfig));
    const res = await axios(config);
    return res;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
