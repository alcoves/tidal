const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const mime = require('mime-types');
const s3 = require('../config/s3');
const ffmpegStrToObj = require('./ffmpegStrToObj');

const { exec } = require('child_process');
const { MEDIA_BUCKET } = require('../config/config');

const getPresetCommands = (preset) => {
  if (preset === 'highQuality') {
    return `-y -hide_banner -progress - -c:v libx264 -preset medium -profile:v high -tune zerolatency -crf 22 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192K -ar 48000 -profile:a aac_low`;
  } else if (preset === '720p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset fast -profile:v high -tune zerolatency -vf scale=1280:-2 -crf 27 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 128k -ar 48000 -profile:a aac_low`;
  } else if (preset === '1080p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset fast -profile:v high -tune zerolatency -vf scale=1920:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192k -ar 48000 -profile:a aac_low`;
  } else if (preset === '1440p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset fast -profile:v high -tune zerolatency -vf scale=2560:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192k -ar 48000 -profile:a aac_low`;
  } else if (preset === '2160p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset fast -profile:v high -tune zerolatency -vf scale=3840:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 128k -ar 48000 -profile:a aac_low`;
  } else {
    throw new Error(`preset ${preset} is not supported`);
  }
};

module.exports = ({
  sourcePath,
  videoId,
  preset,
  metadata,
  overwriteSource = false,
}) => {
  return new Promise(async (resolve, reject) => {
    console.log('creating video paths');
    const fileDir = path.resolve(`./tmp/${uuid()}`);
    await fs.mkdirp(fileDir);
    const fileName = `${preset}.mp4`;
    const fullPath = `${fileDir}/${fileName}`;

    console.log('begin video record');
    await api({
      method: 'patch',
      url: `/videos/${videoId}`,
      data: {
        files: {
          [preset]: {
            startedAt: new Date(),
          },
        },
      },
    });

    console.log('creating video with ffmpeg');
    const presetCommands = getPresetCommands(preset);
    const cmd = `ffmpeg -i ${sourcePath} ${presetCommands} ${fullPath}`;
    const cmdStream = exec(cmd, { maxBuffer: 1024 * 1024 * 1024 });

    cmdStream.stdout.on('data', async (data) => {
      // console.log('stdout data', data);
      console.log('patching video record');

      const split = data.split('\n');
      if (split.some((v) => v.indexOf('frame') >= 0)) {
        const stats = ffmpegStrToObj(data);
        const fileDuration = metadata.duration;
        const secondsProcessed = stats.out_time_ms / 1000 / 1000;

        const timeRemaining =
          (fileDuration - secondsProcessed) /
          parseFloat(stats.speed.split('x'));

        const percentCompleted = (
          (secondsProcessed / fileDuration) *
          100
        ).toFixed(2);

        console.log('percentCompleted', percentCompleted);
        console.log('time remaining', timeRemaining);

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
      }
    });

    cmdStream.stderr.on('data', (error) => {
      console.log('stderr data', error);
    });

    cmdStream.on('exit', async (code) => {
      console.log('code', code);
      console.log('uploading video to object storage');
      const s3Res = await s3
        .upload({
          Bucket: MEDIA_BUCKET,
          Key: `${videoId}/${fileName}`,
          ContentType: mime.lookup(fileName),
          Body: fs.createReadStream(fullPath),
        })
        .promise();

      console.log('patching video record');
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

      if (overwriteSource) {
        console.log('overwriting source video');
        await fs.remove(sourcePath);
        await fs.move(fullPath, sourcePath);
        await fs.remove(fileDir);
      }

      await fs.remove(fileDir);
      resolve('done');
    });
  });
};
