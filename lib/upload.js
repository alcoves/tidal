const s3 = require('../config/s3');
const { MEDIA_BUCKET } = require('../config/config');

module.exports = (params) => {
  return new Promise(async (resolve, reject) => {
    const options = { partSize: 20 * 1024 * 1024, queueSize: 4 };
    const newParams = { ...params, Bucket: MEDIA_BUCKET };
    console.log('uploading object');

    s3.upload(newParams, options)
      .on('httpUploadProgress', (event) => {
        console.log(`Uploaded ${event.loaded} out of ${event.total}`);
      })
      .send((err, data) => {
        if (err) {
          console.error('upload error', error);
          reject(error);
        } else {
          console.log('resolving upload', data);
          resolve(data);
        }
      });
  });
};
