const fs = require('fs-extra');
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

      const { fileDir, sourcePath } = await download(req.params.id);
      const conversion = await new convert(sourcePath)
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
        .add(`${fileDir}/converted.mp4`)
        .process();

      console.log(fileDir);
      // await fs.remove(fileDir);

      console.log('Conversion Complete', conversion);
      isProcessing = false;
      console.log(`is processing? : ${isProcessing}`);
      res.status(200).send();
    }
  } catch (error) {
    isProcessing = false;
    console.error(error);
    res.status(500).send({ error: JSON.stringify(error) });
  }
};
