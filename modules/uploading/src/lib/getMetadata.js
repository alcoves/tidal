const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const s3 = new AWS.S3({ region: 'us-east-2' });

function parseFramerate(r_frame_rate) {
  if (r_frame_rate) {
    const framerate = parseFloat(r_frame_rate.split('/')[0])

    if (framerate >= 59) {
      return 60
    } else if (framerate >= 29) {
      return 30
    } else if (framerate >= 23) {
      return 24
    }
  }

  return null;
}

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
      if (err) return reject(err);
      let duration = 0;

      if (metadata && metadata.format && metadata.format.duration) {
        duration = parseFloat(metadata.format.duration);
      }

      const parsedMetadata = metadata.streams.reduce(
        (acc, cv) => {
          const streamWidth = parseFloat(cv.width);
          const streamHeight = parseFloat(cv.height);
          const streamDuration = parseFloat(cv.duration);
          const framerate = parseFramerate(cv.r_frame_rate);

          if (streamWidth) {
            if (streamWidth > acc.width) acc.width = streamWidth;
          }

          if (streamHeight) {
            if (streamHeight > acc.height) acc.height = streamHeight;
          }

          if (framerate) {
            if (framerate > acc.framerate) acc.framerate = framerate;
          }

          // Fallback to stream duration if container duration is null
          if (!duration && streamDuration > acc.duration) {
            acc.duration = streamDuration;
          }

          return acc;
        },
        { width: 0, height: 0, framerate: 0, duration }
      );

      if (!parsedMetadata.width || !parsedMetadata.height || !parsedMetadata.duration || !parsedMetadata.framerate) {
        console.log('parsedMetadata', parsedMetadata);
        throw new Error('metadata parsing failed');
      }

      console.log('parsedMetadata', parsedMetadata);
      resolve(parsedMetadata);
    });
  });
};
