const express = require('express');
const exec = require('child_process').exec;
const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.status(200).send('hello');
});

app.get('/concat', async (req, res) => {
  const base_dir =
    process.env.NODE_ENV === 'production' ? '/mnt/efs/tidal' : '/tmp';

  const cmd = `./concat.sh ${req.query.in_path} ${req.query.out_path} ${base_dir}`;
  exec(cmd, function (error, stdout, stderr) {
    console.log(stderr);
    if (error) return res.status(500).send(error);
    res.status(200).send(stdout || stderr);
  });
});

app.listen(PORT, () => {
  console.log(`express server running on localhost:${PORT}`);
});
