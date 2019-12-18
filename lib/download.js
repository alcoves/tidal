const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const uuid = require('uuid');

module.exports = async url => {
  return new Promise(async (resolve, reject) => {
    console.log('Downloading video');
    const fileDirId = uuid();

    const fileDir = path.resolve(`./tmp/${fileDirId}`);
    await fs.mkdirp(fileDir);

    const sourcePath = path.resolve(`${fileDir}/source.mp4`);
    const writer = fs.createWriteStream(sourcePath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);
    writer.on('error', reject);
    writer.on('finish', () => {
      console.log('Downloading complete');
      resolve({ sourcePath, fileDir })
    });
  });
};
