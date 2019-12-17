const fs = require('fs-extra');
const express = require('express');
const convert = require('../lib/convert');
const download = require('../lib/download');

const app = express();
const port = 4000;

let isProcessing = false;

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'server is online',
  });
});

app.get('/convert', async (req, res) => {
  if (!req.query.url) {
    return res.status(400).send({ message: 'invalid url' });
  }

  if (isProcessing) {
    res.status(429).send({
      message: 'server busy',
    });
  } else {
    isProcessing = true;
    res.status(200).send({
      message: 'started running tests',
    });

    console.log('Converting video');
    const videoPath = await download(req.query.url);
    const conversion = await new convert(videoPath)
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
      .add('./data/export/legend-convert.mp4')
      .process();

    console.log('Conversion Complete', conversion);
    isProcessing = false;
    console.log(`is processing? : ${isProcessing}`);
  }
});

app.get('/stats', async (req, res) => {
  if (isProcessing) {
    res.status(429).send({ message: 'busy' });
  } else {
    res.status(200).send({
      message: 'stats',
      payload: JSON.parse(await fs.readFile(resultPath)),
    });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
