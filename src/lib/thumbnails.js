const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

const createThumbnail = (videoPath, timemark = '00:00:00.000') => {
  return new Promise((resolve, reject) => {
    const pathParts = videoPath.split('/');
    pathParts.pop();
    pathParts.push('thumb.jpg');
    const thumbnailPath = pathParts.join('/');

    ffmpeg(videoPath)
      .outputOptions([
        '-vframes 1',
        `-ss ${timemark}`,
        '-filter:v scale=720:-2',
      ])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', () => resolve(thumbnailPath))
      .output(thumbnailPath)
      .run();
  });
};

const uploadThumbnail = (objPath, Key) => {
  return s3
    .upload({
      Key,
      Bucket: '',
      Body: fs.createReadStream(objPath),
    })
    .promise();
};

const setThumbnailUrl = () => {};

module.exports = {
  createThumbnail,
  uploadThumbnail,
  setThumbnailUrl,
};
