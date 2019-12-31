require('dotenv').config();

const fs = require('fs-extra');
const convert = require('./lib/convert');
const download = require('./lib/download');

const { request } = require('./lib/api');

(async () => {
  const { type, preset, id: videoId } = require('yargs').argv;

  switch (type) {
    case 'video':
      switch (preset) {
        case 'all':
          console.log(
            `converting ${type} with preset ${preset} and id ${videoId}`
          );

          await request({
            method: 'patch',
            url: `/videos/${videoId}`,
            data: { status: 'processing' },
          });

          const { sourceDir, sourcePath } = await download(videoId);

          const { height, width } = await new convert(
            videoId,
            sourcePath
          ).metadata();

          await new convert(videoId, sourcePath)
            .pre('-ss 00:00:00')
            .add('-y')
            .add('-progress -')
            .add('-vframes 1')
            .add('-q:v 3')
            .process('thumbnail.jpg');

          if (width >= 1280) {
            await new convert(videoId, sourcePath)
              .add('-y')
              .add('-progress -')
              .add('-c:v libx264')
              .add('-preset veryfast')
              .add('-profile:v high')
              .add('-vf scale=1280:-2')
              .add('-crf 26')
              .add('-coder 1')
              .add('-pix_fmt yuv420p')
              .add('-movflags +faststart')
              .add('-bf 2')
              .add('-c:a aac')
              .add('-ac 2')
              .add('-b:a 128k')
              .add('-ar 48000')
              .add('-profile:a aac_low')
              .process('720p.mp4');
          }

          if (width >= 1920) {
            await new convert(videoId, sourcePath)
              .add('-y')
              .add('-progress -')
              .add('-c:v libx264')
              .add('-preset veryfast')
              .add('-profile:v high')
              .add('-vf scale=1920:-2')
              .add('-crf 26')
              .add('-coder 1')
              .add('-pix_fmt yuv420p')
              .add('-movflags +faststart')
              .add('-bf 2')
              .add('-c:a aac')
              .add('-ac 2')
              .add('-b:a 192K')
              .add('-ar 48000')
              .add('-profile:a aac_low')
              .process('1080p.mp4');
          }

          if (width >= 2560) {
            await new convert(videoId, sourcePath)
              .add('-y')
              .add('-progress -')
              .add('-c:v libx264')
              .add('-preset veryfast')
              .add('-profile:v high')
              .add('-vf scale=2560:-2')
              .add('-crf 26')
              .add('-coder 1')
              .add('-pix_fmt yuv420p')
              .add('-movflags +faststart')
              .add('-bf 2')
              .add('-c:a aac')
              .add('-ac 2')
              .add('-b:a 192K')
              .add('-ar 48000')
              .add('-profile:a aac_low')
              .process('1440p.mp4');
          }

          await new convert(videoId, sourcePath)
            .add('-y')
            .add('-progress -')
            .add('-c:v libx264')
            .add('-preset veryfast')
            .add('-profile:v high')
            .add('-crf 22')
            .add('-coder 1')
            .add('-pix_fmt yuv420p')
            .add('-movflags +faststart')
            .add('-bf 2')
            .add('-c:a aac')
            .add('-ac 2')
            .add('-b:a 192K')
            .add('-ar 48000')
            .add('-profile:a aac_low')
            .process('source.mp4');

          await request({
            method: 'patch',
            url: `/videos/${videoId}`,
            data: { status: 'completed' },
          });

          await fs.remove(sourceDir);

          break;
        default:
          throw new Error(`unspecified preset, ${preset}`);
      }
      break;
    default:
      throw new Error(`unspecified type, ${type}`);
  }
})();
