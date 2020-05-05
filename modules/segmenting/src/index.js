const AWS = require('aws-sdk');
const express = require('express');
const segment = require('./lib/segment');

const s3ls = require('./lib/s3ls');
const enqueue = require('./lib/enqueue');
const getMetdata = require('./lib/getMetdata');
const getPresets = require('./lib/getPresets');

const port = 3000;
const app = express();
const s3 = new AWS.S3({ region: 'us-east-1' });

const Bucket =
  process.env.NODE_ENV === 'production' ? process.env.BUCKET : 'tidal-bken-dev';

const requests = [];
let processing = false;

app.post('/segments/:videoId/:segment', async (req, res) => {
  const { videoId, segment } = req.params;
  processing = true;
  requests.push(segment);

  await s3
    .upload({
      Bucket,
      Body: req,
      Key: `segments/source/${videoId}/${segment}`,
    })
    .promise();

  console.log(`express uploaded ${videoId}/${segment}`, Date.now());
  res.end();
  requests.pop();
});

const server = app.listen(port, () => console.log(`http://localhost:${port}`));

module.exports.handler = async ({ videoId, filename }) => {
  const signedUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket,
    Key: `uploads/${videoId}/${filename}`,
  });

  const segmentFolder = `segments/source/${videoId}/`;
  await segment(signedUrl, videoId);

  const interval = setInterval(() => {
    if (processing && !requests.length) {
      console.log('server is done processing');
      server.close(async () => {
        console.log('server is closed');
        clearInterval(interval);

        const metadata = await getMetdata(signedUrl);
        console.log(metadata);

        const presets = getPresets(metadata.width);
        console.log('presets', presets);

        let segments = await s3ls({ Bucket, Prefix: segmentFolder });
        console.log(`segment length: ${segments.length}`);

        await enqueue(segments, presets, videoId);
      });
    } else {
      console.log('server is still processing');
    }
  }, 250);
};
