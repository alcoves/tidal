const s3 = require('../config/s3');
const logger = require('./logger');

const { MEDIA_BUCKET } = require('../config/config');

module.exports = (params) => {
  return new Promise(async (resolve, reject) => {
    // const options = { partSize: 20 * 1024 * 1024, queueSize: 4 };
    const newParams = { ...params, Bucket: MEDIA_BUCKET };
    logger.info(JSON.stringify(params));

    s3.upload(newParams)
      .on('httpUploadProgress', (event) => {
        logger.info(`Uploaded ${event.loaded} out of ${event.total}`);
      })
      .send((error, data) => {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          logger.info('Uploaded file successfully', data);
          resolve(data);
        }
      });
  });
};
