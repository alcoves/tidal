const AWS = require('aws-sdk');
const express = require('express');
const segment = require('./lib/segment');

const port = 3000;
const app = express();

const s3 = new AWS.S3({ region: 'us-east-1' });

// TODO :: Interpolate
const BUCKET = 'tidal-bken-dev';

app.post('/segments/:videoId/:segment', (req, res) => {
  const { videoId, segment } = req.params;
  s3.upload({
    Body: req,
    Bucket: BUCKET,
    Key: `segments/source/${videoId}/${segment}`,
  })
    .promise()
    .then(() => {
      console.log(`express uploaded ${videoId}/${segment}`);
      res.end();
    })
    .catch((error) => {
      console.error(error);
      res.end();
      throw error;
    });
});

module.exports.handler = ({ videoId, filename }) => {
  console.log('starting server');
  let server;
  server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    segment({ videoId, filename }).then(server.close).catch(server.close);
  });
};
