const fs = require('fs-extra');
const AWS = require('aws-sdk');

const { exec } = require('child_process');

const bucket = 'tidal-bken-dev';
const s3 = new AWS.S3({ region: 'us-east-1' });

const ffmpeg =
  process.env.NODE_ENV === 'production' ? '/opt/ffmpeg/ffmpeg' : 'ffmpeg';

module.exports = (segments) => {
  return new Promise(async (resolve, reject) => {
    if (segments.length % 2) {
      console.log('wanting to concatinate an odd segment');
      // const { Key: oddSegment } = segments.pop();
      // const { Key: concatWith } = segments.pop();

      // const concatName = concatWith.split('/').pop();

      // // to be safe we delete the file if it exists
      // await fs.remove(`/tmp/${concatName}`);

      // const signed1 = await s3.getSignedUrlPromise({
      //   Bucket: bucket,
      //   Key: oddSegment,
      // });

      // const signed2 = await s3.getSignedUrlPromise({
      //   Bucket: bucket,
      //   Key: concatWith,
      // });

      // const ffmpegCmd = [
      //   `${ffmpeg}`,
      //   `-i "${signed1}"`,
      //   `-i "${signed2}"`,
      //   '-f matroska',
      //   '-c copy',
      //   `/tmp/${concatName}`,
      // ];

      // exec(ffmpegCmd, (error, stdout, stderr) => {
      //   // ffmpeg early returns even though segments are still uploading
      //   if (error) reject(error);
      //   console.log('FFMPEG STDOUT: ' + stdout);
      //   console.log('FFMPEG STDERR: ' + stderr);

      //   s3.upload({
      //     Bucket: bucket,
      //     Key: concatWith,
      //     Body: fs.createReadStream(`/tmp/${concatName}`),
      //   })
      //     .promise()
      //     .then(() => {
      //       fs.removeSync(`/tmp/${concatName}`);
      //       resolve();
      //     });
      // });
    }

    resolve();
  });
};
