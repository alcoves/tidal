const api = require('./api');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs-extra');
const s3 = require('../config/s3');
const logger = require('./logger');

module.exports = async (videoId) => {
  return new Promise(async (resolve, reject) => {
    logger.info('downloading source video');
    const sourceDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(sourceDir);

    try {
      const data = await api.getVideo(videoId);
      const sourceFile = data.video.sourceFile;
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
        logger.info('Download complete!');
        resolve({ sourceDir, sourcePath });
      });
    } catch (error) {
      logger.error(error);
      await fs.remove(sourceDir);
      reject(error);
    }
  });
};
