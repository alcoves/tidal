const api = require('./api');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs-extra');
const s3 = require('../config/s3');

module.exports = async (videoId) => {
  return new Promise(async (resolve, reject) => {
    const sourceDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(sourceDir);

    try {
      const { data } = await api({
        method: 'get',
        url: `/videos/${videoId}`,
      });

      const sourceFile = data.payload.sourceFile;
      const sourcePath = path.resolve(`${sourceDir}/source.mp4`);
      const writer = fs.createWriteStream(sourcePath);

      s3.getObject({
        Bucket: 'media-bken',
        Key: sourceFile.split('media-bken/')[1],
      })
        .createReadStream()
        .on('error', (error) => reject(error))
        .pipe(writer);

      writer.on('close', () => {
        console.log('Download complete!');
        resolve({ sourceDir, sourcePath });
      });
    } catch (error) {
      console.error('Download error', error);
      await fs.remove(sourceDir);
      throw error;
    }
  });
};
