const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const sharp = require('sharp');
const mime = require('mime-types');
const logger = require('./logger');
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
        logger.info('on end');
        resolve();
      })
      .on('error', (error) => {
        logger.info(error);
        reject(error);
      });
  });
};

module.exports = async (sourcePath, videoId) => {
  logger.info('creating thumbnail paths');
  const fileDir = path.resolve(`./tmp/${uuid()}`);
  await fs.mkdirp(fileDir);
  const fileName = 'thumbnail.jpg';
  const fullPath = `${fileDir}/${fileName}`;

  logger.info('creating thumbnail with ffmpeg');
  await processThumbnail(sourcePath, fullPath);

  logger.info('compressing thumbnail with sharp');
  const thumbnailBuffer = await sharp(fullPath)
    .resize({ width: 720, height: 480 })
    .jpeg({ quality: 70, progressive: true })
    .toBuffer(fullPath);

  logger.info('uploading thumbnail to object storage');
  const s3Res = await s3
    .upload({
      Bucket: MEDIA_BUCKET,
      Key: `videos/${videoId}/${fileName}`,
      ContentType: mime.lookup(fileName),
      Body: thumbnailBuffer,
    })
    .promise();

  logger.info('patching video record');

  await api.mutate({
    mutation: gql`mutation {
      updateVideo(id: "${videoId}", input: { thumbnail: "${s3Res.Location}" }) {
        thumbnail
      }
    }`,
  });

  logger.info('removing thumbnail directory');
  await fs.remove(fileDir);
};
