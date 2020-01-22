const fs = require('fs-extra');
const upload = require('./upload');
const s3 = require('../config/s3');

const { exec } = require('child_process');
const { MEDIA_BUCKET } = require('../config/config');

module.exports = async (videoId) => {
  try {
    if (videoId) {
      const { KeyCount } = await s3
        .listObjectsV2({
          Bucket: MEDIA_BUCKET,
          Prefix: `videos/${videoId}`,
        })
        .promise();

      if (KeyCount) {
        await Promise.all(
          ['combined.log', 'error.log'].map((path) => {
            return upload({
              ContentType: 'text/plain',
              Key: `videos/${videoId}/logs/${new Date().toISOString()}-${path}`,
              Body: fs.createReadStream(`./${path}`),
            });
          })
        );
      }
    }
  } catch (error) {
    console.error(error);
  }

  if (process.env.NODE_ENV === 'production') {
    fs.removeSync('./combined.log');
    fs.removeSync('./error.log');
    exec(`scripts/terminate.sh ${process.env.DO_API_KEY}`);
  }
};
