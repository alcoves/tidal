const express = require('express');
const exec = require('child_process').exec;
const app = express();

const PORT = process.env.PORT || 4000;

const base_dir =
  process.env.NODE_ENV === 'production' ? '/mnt/efs/tidal' : '/tmp';

app.get('/', (req, res) => {
  res.status(200).send('hello');
});

let isProcessing = false;
const concatQueue = [];

setInterval(() => {
  // console.log(
  //   `isProcessing: ${isProcessing}, concatQueueLength: ${concatQueue.length}`
  // );

  if (!isProcessing && concatQueue.length) {
    isProcessing = true;
    const cmd = concatQueue.pop();
    exec(cmd, function (error, stdout, stderr) {
      console.log(error);
      console.log(stderr);
      isProcessing = false;
    });
  }
}, 200);

app.get('/concat', async (req, res) => {
  concatQueue.push(
    `./concat.sh ${req.query.in_path} ${req.query.out_path} ${base_dir}`
  );
  res.status(202).send('recieved');
});

app.listen(PORT, () => {
  console.log(`express server running on localhost:${PORT}`);
});
