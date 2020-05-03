const AWS = require('aws-sdk');
const express = require('express');
const port = 3000;
const app = express();

const s3 = new AWS.S3({ region: 'us-east-1' });
const sqs = new AWS.SQS({ region: 'us-east-1' });

const segment = require('./lib/segment');
const getPresets = require('./lib/getPresets');

// TODO :: Interpolate
const BUCKET = 'tidal-bken-dev';
const TRANSCODING_QUEUE_URL =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

app.post('/segments/:videoId/:width/:segment', (req, res) => {
  const { videoId, width, segment } = req.params;

  s3.upload({
    Body: req,
    Bucket: BUCKET,
    Key: `segments/source/${videoId}/${segment}`,
  })
    .promise()
    .then((data) => {
      const messages = getPresets(width).map(({ presetName, ffmpegCmdStr }) => {
        return {
          QueueUrl: TRANSCODING_QUEUE_URL,
          MessageBody: JSON.stringify({
            ffmpeg_cmd: ffmpegCmdStr,
            in_path: `s3://${BUCKET}/segments/source/${videoId}/${segment}`,
            out_path: `s3://${BUCKET}/segments/transcoded/${videoId}/${presetName}/${segment}`,
          }),
        };
      });

      Promise.all(
        messages.map((m) => {
          console.log('sending sqs message');
          sqs.sendMessage(m).promise();
        })
      )
        .then(() => {
          console.log('segment upload success', data.Key);
        })
        .catch((error) => {
          console.error('failed to send message to sqs');
          throw error;
        });
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
    segment({ videoId, filename })
      .then(() => {
        console.error('closing server from then');
        server.close();
      })
      .catch((error) => {
        console.error('closing server from catch', error);
        server.close();
      });
  });
};
