const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const uuid = require('uuid');

const apiUrl = 'http://localhost:3000';

module.exports = async (videoId) => {
  return new Promise(async (resolve, reject) => {
    const sourceDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(sourceDir);

    try {
      const sourcePath = path.resolve(`${sourceDir}/source.mp4`);
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
        resolve({ sourceDir, sourcePath });
      });
    } catch (error) {
      console.error(error);
      await fs.remove(sourceDir);
      throw error;
    }
  });
};
