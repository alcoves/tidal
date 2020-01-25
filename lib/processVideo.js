const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const logger = require('./logger');
const mime = require('mime-types');
const upload = require('./upload');
const ffmpeg = require('fluent-ffmpeg');
const getPreset = require('./getPreset');

module.exports = async ({ sourcePath, videoId, preset, metadata }) => {
  try {
    logger.info('creating video paths');
    const fileDir = path.resolve(`./tmp/${uuid()}`);
    fs.mkdirpSync(fileDir);
    const fileName = `${preset}.mp4`;
    const fullPath = `${fileDir}/${fileName}`;

    logger.info('begin video record');
    await api.updateVideo();

    logger.info('creating video with ffmpeg');
    const options = getPreset(preset);
    await new Promise((resolve, reject) => {
      ffmpeg(sourcePath)
        .outputOptions(options)
        .on('start', (cmd) => logger.info(cmd))
        .on('progress', (data) => {
          const tm = data.timemark.split(':');
          const totalDuration = metadata.streams[0].duration;
          const durationCompleted = +tm[0] * 60 * 60 + +tm[1] * 60 + +tm[2];

          const percentCompleted = (
            (durationCompleted / totalDuration) *
            100
          ).toFixed(1);

          api.updateVideo(videoId, {
            files: {
              [preset]: {
                status: 'processing',
                percentCompleted,
              },
            },
          });
        })
        .on('end', resolve)
        .on('error', reject)
        .save(fullPath);
    });

    logger.info('uploading video to object storage');
    const s3Res = await upload({
      Key: `videos/${videoId}/${fileName}`,
      ContentType: mime.lookup(fileName),
      Body: fs.createReadStream(fullPath),
    });

    await api.updateVideo(videoId, {
      files: {
        [preset]: {
          status: 'completed',
          link: s3Res.Location,
          percentCompleted: 100,
          completedAt: new Date(),
        },
      },
    });

    fs.removeSync(fileDir);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
