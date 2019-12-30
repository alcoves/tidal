const fs = require('fs-extra');
const api = require('../lib/api');
const convert = require('../lib/convert');
const download = require('../lib/download');

let isProcessing = false;

exports.createVideo = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: 'videoId cannot be null' });
    }

    if (isProcessing) {
      res.status(429).send({ message: 'server busy' });
    } else {
      isProcessing = true;
      await api({
        method: 'patch',
        url: `/videos/${req.params.id}`,
        data: { status: 'processing' },
      });

      const { sourceDir, sourcePath } = await download(req.params.id);

      const { height, width } = await new convert(
        req.params.id,
        sourcePath
      ).metadata();

      await new convert(req.params.id, sourcePath)
        .pre('-ss 00:00:00')
        .add('-y')
        .add('-progress -')
        .add('-vframes 1')
        .add('-q:v 3')
        .process('thumbnail.jpg');

      if (width >= 1280) {
        await new convert(req.params.id, sourcePath)
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
        await new convert(req.params.id, sourcePath)
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
        await new convert(req.params.id, sourcePath)
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

      await new convert(req.params.id, sourcePath)
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
        .process('hq.mp4');

      await api({
        method: 'patch',
        url: `/videos/${req.params.id}`,
        data: { status: 'completed' },
      });

      isProcessing = false;
      console.log(`Conversion Complete, is processing? : ${isProcessing}`);
      console.log('removing local directory', sourceDir);
      await fs.remove(sourceDir);
      res.status(200).send();
    }
  } catch (error) {
    isProcessing = false;
    console.error(error);
    res.status(500).send({ error: JSON.stringify(error) });
  }
};

module.exports.createCustomConversion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: 'videoId cannot be null' });
    }

    if (isProcessing) {
      res.status(429).send({ message: 'server busy' });
    } else {
      const customerConvert = new convert(req.params.id, sourcePath)
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
        .process('hq.mp4');

      await customerConvert.process('');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
