const axios = require('axios');

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.bken.io'
    : 'http://localhost:3000';

module.exports = (config) => {
  return new Promise((resolve, reject) => {
    config.headers = {
      authorization: process.env.CONVERSION_API_KEY,
      'Content-Type': 'application/json',
    };
    config.url = `${baseUrl}${config.url}`;
    console.log('axios config', JSON.stringify(config, null, 2));
    axios(config)
      .then(resolve)
      .catch(reject);
  });
};
