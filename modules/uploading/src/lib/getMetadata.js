const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const s3 = new AWS.S3({ region: 'us-east-1' });

module.exports = function getMetadata(url) {
  return new Promise(async (resolve, reject) => {
    const urlParts = url.split('s3://')[1].split('/');

    const Bucket = urlParts.shift();
    const Key = urlParts.join('/');

    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Key,
      Bucket,
    });

    ffmpeg.ffprobe(signedUrl, function (err, metadata) {
      if (err) reject(err);
      resolve(
        metadata.streams.reduce((acc, cv) => {
          if (cv.width) acc.width = parseInt(cv.width);
          if (cv.height) acc.height = parseInt(cv.height);
          if (cv.duration) acc.duration = parseFloat(cv.duration);
          return acc;
        }, {})
      );
    });
  });
};
