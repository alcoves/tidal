const path = require('path');
const uuid = require('uuid');
const fs = require('fs-extra');
const s3 = require('../config/s3');
const logger = require('./logger');

module.exports = async (videoId) => {
  return new Promise(async (resolve, reject) => {
    const sourceDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(sourceDir);

    try {
      const sourcePath = path.resolve(`${sourceDir}/highQuality.mp4`);
      const writer = fs.createWriteStream(sourcePath);

      s3.getObject({
        Bucket: 'media-bken',
        Key: `${videoId}/highQuality.mp4`,
      })
        .createReadStream()
        .on('error', (error) => reject(error))
        .pipe(writer);

      writer.on('close', () => {
        logger.info('Download complete!');
        resolve({ sourceDir, sourcePath });
      });
    } catch (error) {
      logger.error(error);
      await fs.remove(sourceDir);
      throw error;
    }
  });
};
