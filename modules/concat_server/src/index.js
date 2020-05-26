const express = require('express');
const exec = require('child_process').exec;
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('hello');
});

app.get('/concat', async (req, res) => {
  const cmd = `./concat.sh ${req.query.in_path} ${req.query.out_path}`;
  exec(cmd, function (error, stdout, stderr) {
    if (error) return res.status(500).send(error);
    res.status(200).send(stdout || stderr);
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`express server running on localhost:${PORT}`);
});
