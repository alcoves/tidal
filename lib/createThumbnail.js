const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const sharp = require('sharp');
const mime = require('mime-types');
const s3 = require('../config/s3');
const ffmpeg = require('fluent-ffmpeg');

const { MEDIA_BUCKET } = require('../config/config');

const processThumbnail = (sourcePath, fullPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(sourcePath)
      .inputOptions('-ss 00:00:00')
      .outputOptions('-vframes 1')
      .save(fullPath)
      .on('end', () => {
        console.log('on end');
        resolve();
      })
      .on('error', (error) => {
        console.log('on error', error);
        reject(error);
      });
  });
};

module.exports = async (sourcePath, videoId) => {
  console.log('creating thumbnail paths');
  const fileDir = path.resolve(`./tmp/${uuid()}`);
  await fs.mkdirp(fileDir);
  const fileName = 'thumbnail.jpg';
  const fullPath = `${fileDir}/${fileName}`;

  console.log('creating thumbnail with ffmpeg');
  await processThumbnail(sourcePath, fullPath);

  console.log('compressing thumbnail with sharp');
  const thumbnailBuffer = await sharp(fullPath)
    .resize({ width: 720, height: 480 })
    .jpeg({ quality: 70, progressive: true })
    .toBuffer(fullPath);

  console.log('uploading thumbnail to object storage');
  const s3Res = await s3
    .upload({
      Bucket: MEDIA_BUCKET,
      Key: `${videoId}/${fileName}`,
      ContentType: mime.lookup(fileName),
      Body: thumbnailBuffer,
    })
    .promise();

  console.log('patching video record');
  await api({
    method: 'patch',
    url: `/videos/${videoId}`,
    data: { thumbnail: s3Res.Location },
  });

  console.log('removing thumbnail directory');
  await fs.remove(fileDir);
};
