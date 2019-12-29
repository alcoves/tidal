const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const uuid = require('uuid');

const apiUrl = 'http://localhost:3000';

module.exports = async (videoId) => {
  return new Promise(async (resolve, reject) => {
    console.log(`Downloading video: ${videoId}`);
    const fileDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(fileDir);

    try {
      const sourcePath = path.resolve(`${fileDir}/source.mp4`);
      const writer = fs.createWriteStream(sourcePath);

      const { data } = await axios.get(`${apiUrl}/videos/${videoId}`);

      const response = await axios({
        method: 'GET',
        responseType: 'stream',
        url: data.payload.media.source,
      });

      response.data.pipe(writer);
      writer.on('error', reject);
      writer.on('finish', () => {
        console.log('Downloading complete');
        resolve({ sourcePath, fileDir });
      });
    } catch (error) {
      console.error(error);
      await fs.remove(fileDir);
    }
  });
};
