const AWS = require('aws-sdk');
const express = require('express');
const s3ls = require('./lib/s3ls');
const segment = require('./lib/segment');

const port = 3000;
const app = express();

const s3 = new AWS.S3({ region: 'us-east-1' });
const sqs = new AWS.SQS({ region: 'us-east-1' });

// TODO :: Interpolate
const BUCKET = 'tidal-bken-dev';
const TRANSCODING_QUEUE_URL =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

app.post('/segments/:videoId/:segment', (req, res) => {
  const { videoId, segment } = req.params;
  s3.upload({
    Body: req,
    Bucket: BUCKET,
    Key: `segments/source/${videoId}/${segment}`,
  })
    .promise()
    .then(() => {
      console.log(`done with ${videoId}/${segment}`);
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
      .then(({ presets }) => {
        server.close(() => {
          // server was closed successfully, this generally means all segments were uploaded
          s3ls({
            Bucket: BUCKET,
            Prefix: `segments/source/${videoId}/`,
          }).then((segments) => {
            // We can determine if there is an odd segment and directly invoke the transformer
            // with the metadata we want to write

            for (let i = 0; i < segments.length; i++) {
              const { Key } = segments[i];
              const segName = Key.split('/').pop();
              const lastOddSeg = Boolean(
                i + 1 === segments.length && segments.length % 2 === 1
              );
              console.log('segment key', Key);
              console.log('segName', segName);
              console.log('lastSegOdd', lastOddSeg);
              const messages = presets.map(({ presetName, ffmpegCmdStr }) => {
                return {
                  QueueUrl: TRANSCODING_QUEUE_URL,
                  MessageBody: JSON.stringify({
                    ffmpeg_cmd: ffmpegCmdStr,
                    last_odd_segment: lastOddSeg,
                    in_path: `s3://${BUCKET}/segments/source/${videoId}/${segName}`,
                    out_path: `s3://${BUCKET}/segments/transcoded/${videoId}/${presetName}/1/${segName}`,
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
                  console.log('segment upload success');
                })
                .catch((error) => {
                  console.error('failed to send message to sqs');
                  throw error;
                });
            }
          });
        });
      })
      .catch((error) => {
        console.error('closing server from catch', error);
        server.close();
      });
  });
};
