const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const mime = require('mime-types');
const upload = require('./upload');
const ffmpeg = require('fluent-ffmpeg');
const getPreset = require('./getPreset');

const fluent = ({
  sourcePath,
  fullPath,
  options,
  metadata,
  preset,
  videoId,
}) => {
  return new Promise((resolve, reject) => {
    ffmpeg(sourcePath)
      .outputOptions(options)
      .save(fullPath)
      .on('start', (cmd) => console.log(cmd))
      .on('progress', (data) => {
        const tm = data.timemark.split(':');
        const totalDuration = metadata.streams[0].duration;
        const durationCompleted = +tm[0] * 60 * 60 + +tm[1] * 60 + +tm[2];

        const percentCompleted = (
          (durationCompleted / totalDuration) *
          100
        ).toFixed(1);

        api({
          method: 'patch',
          url: `/videos/${videoId}`,
          data: {
            files: {
              [preset]: {
                status: 'processing',
                percentCompleted,
              },
            },
          },
        });
      })
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

module.exports = async ({ sourcePath, videoId, preset, metadata }) => {
  try {
    console.log('creating video paths');
    console.log('metadata', metadata);
    const fileDir = path.resolve(`./tmp/${uuid()}`);
    fs.mkdirpSync(fileDir);
    const fileName = `${preset}.mp4`;
    const fullPath = `${fileDir}/${fileName}`;

    console.log('begin video record');
    await api({
      method: 'patch',
      url: `/videos/${videoId}`,
      data: {
        files: { [preset]: { status: 'processing', startedAt: new Date() } },
      },
    });

    console.log('creating video with ffmpeg');
    const options = getPreset(preset);
    await fluent({ sourcePath, videoId, fullPath, options, preset, metadata });

    console.log('uploading video to object storage');
    const s3Res = await upload({
      Key: `${videoId}/${fileName}`,
      ContentType: mime.lookup(fileName),
      Body: fs.createReadStream(fullPath),
    });

    await api({
      method: 'patch',
      url: `/videos/${videoId}`,
      data: {
        files: {
          [preset]: {
            status: 'completed',
            link: s3Res.Location,
            percentCompleted: 100,
            completedAt: new Date(),
          },
        },
      },
    });

    fs.removeSync(fileDir);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
