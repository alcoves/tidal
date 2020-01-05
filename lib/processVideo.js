const path = require('path');
const uuid = require('uuid');
const api = require('./api');
const fs = require('fs-extra');
const mime = require('mime-types');
const upload = require('./upload');
const ffmpegStrToObj = require('./ffmpegStrToObj');

const { exec } = require('child_process');

const getPresetCommands = (preset) => {
  if (preset === 'highQuality') {
    return `-y -hide_banner -progress - -c:v libx264 -preset veryfast -profile:v high -crf 22 -coder 1 -c:a aac -ac 2 -b:a 192K -ar 48000 -profile:a aac_low`;
  } else if (preset === '720p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset veryfast -profile:v high -vf scale=1280:-2 -crf 27 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 128k -ar 48000 -profile:a aac_low`;
  } else if (preset === '1080p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset veryfast -profile:v high -vf scale=1920:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192k -ar 48000 -profile:a aac_low`;
  } else if (preset === '1440p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset veryfast -profile:v high -vf scale=2560:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192k -ar 48000 -profile:a aac_low`;
  } else if (preset === '2160p') {
    return `-y -hide_banner -progress - -c:v libx264 -preset veryfast -profile:v high -vf scale=3840:-2 -crf 26 -coder 1 -pix_fmt yuv420p -movflags +faststart -bf 2 -c:a aac -ac 2 -b:a 192k -ar 48000 -profile:a aac_low`;
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
  return new Promise((resolve, reject) => {
    try {
      console.log('creating video paths');
      const fileDir = path.resolve(`./tmp/${uuid()}`);
      fs.mkdirpSync(fileDir);
      const fileName = `${preset}.mp4`;
      const fullPath = `${fileDir}/${fileName}`;

      console.log('begin video record');
      api({
        method: 'patch',
        url: `/videos/${videoId}`,
        data: {
          files: {
            [preset]: {
              startedAt: new Date(),
            },
          },
        },
      }).then(() => {
        console.log('creating video with ffmpeg');
        const presetCommands = getPresetCommands(preset);
        const cmd = `ffmpeg -i ${sourcePath} ${presetCommands} ${fullPath}`;
        const cmdStream = exec(cmd, { maxBuffer: 1024 * 1024 * 1024 });

        cmdStream.stdout.on('data', (data) => {
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

        cmdStream.on('exit', (code) => {
          console.log('code', code);
          console.log('uploading video to object storage');

          upload({
            Key: `${videoId}/${fileName}`,
            ContentType: mime.lookup(fileName),
            Body: fs.createReadStream(fullPath),
          }).then((s3Res) => {
            console.log('patching video record', s3Res);
            api({
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
            }).then(() => {
              if (overwriteSource) {
                console.log('overwriting source video');
                fs.removeSync(sourcePath);
                fs.moveSync(fullPath, sourcePath);
                fs.removeSync(fileDir);
              }

              fs.removeSync(fileDir);
              resolve();
            });
          });
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
