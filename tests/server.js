const fs = require('fs-extra');
const express = require('express');
const convert = require('../lib/convert');

const app = express();
const port = 4000;

let isProcessing = false;

try {
  fs.mkdirSync('./results');
} catch (error) {}

const resultPath = './results/out.json';

const runVideoTest = async () => {
  const res = await convert();
  await fs.writeFile(resultPath, JSON.stringify(res, null, 2));
};

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'server is online',
  });
});

app.get('/test', async (req, res) => {
  if (isProcessing) {
    res.status(429).send({
      message: 'server busy',
    });
  } else {
    isProcessing = true;
    res.status(200).send({
      message: 'started running tests',
    });

    console.log('Running video test');
    await runVideoTest();
    isProcessing = false;
    console.log('is processing');
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
