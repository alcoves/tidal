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
      console.log('ffprobe', metadata);
      if (err) reject(err);
      let duration = 0;

      if (metadata && metadata.format && metadata.format.duration) {
        duration = parseFloat(metadata.format.duration);
      }

      const parsedMetadata = metadata.streams.reduce(
        (acc, cv) => {
          const streamWidth = parseFloat(cv.width);
          const streamHeight = parseFloat(cv.height);
          const streamDuration = parseFloat(cv.duration);

          if (streamWidth) {
            if (streamWidth > acc.width) acc.width = streamWidth;
          }

          if (streamHeight) {
            if (streamHeight > acc.height) acc.height = streamHeight;
          }

          // Fallback to stream duration if container duration is undefined
          if (!duration && streamDuration > acc.duration) {
            acc.duration = streamDuration;
          }

          return acc;
        },
        { width: 0, height: 0, duration }
      );

      console.log('parsedMetadata', parsedMetadata);
      resolve(parsedMetadata);
    });
  });
};
