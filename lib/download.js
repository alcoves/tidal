const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

module.exports = async url => {
  return new Promise(async (resolve, reject) => {
    const outPath = path.resolve(`./test.mp4`);
    const writer = fs.createWriteStream(outPath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);
    writer.on('finish', () => resolve(outPath));
    writer.on('error', reject);
  });
};
