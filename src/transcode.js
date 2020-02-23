const _ = require('lodash');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const TidalEvent = require('./lib/events');

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

const sleep = (t) => new Promise((r) => setTimeout(() => r(), t));

const { bucket, preset, videoId, ffmpegCmdStr } = require('yargs').argv;

if (!bucket) throw new Error('bucket must be defined');
if (!preset) throw new Error('preset must be defined');
if (!videoId) throw new Error('videoId must be defined');
if (!ffmpegCmdStr) throw new Error('ffmpegCmdStr must be defined');

const events = new TidalEvent({
  videoId,
  region: 'us-east-1',
  snsTopicArn: 'arn:aws:sns:us-east-1:594206825329:bken-prod-tidal-events',
});

(async () => {
  const segmentSourcePath = `${videoId}/segments`;
  const transcodeDestinationPath = `${videoId}/transcoded/${preset}`;

  console.log('reading segments');
  const { Contents: segments } = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: segmentSourcePath,
    })
    .promise();

  console.log('enqueuing messages');
  for (const batch of _.chunk(segments, 10)) {
    await sqs
      .sendMessageBatch({
        QueueUrl:
          'https://sqs.us-east-1.amazonaws.com/594206825329/dev-transcoding',
        Entries: batch.map(({ Key }) => {
          const split = Key.split('/');
          const segName = split[split.length - 1];
          return {
            Id: uuid(),
            MessageBody: JSON.stringify({
              ffmpegCommand: ffmpegCmdStr,
              inPath: `${bucket}/${segmentSourcePath}/${segName}`,
              outPath: `${bucket}/${transcodeDestinationPath}/${segName}`,
            }),
          };
        }),
      })
      .promise();
  }

  console.log('waiting for transcode');
  const { Contents: segmentedItems } = await s3
    .listObjectsV2({ Bucket: bucket, Prefix: segmentSourcePath })
    .promise();

  let s3Res = { Contents: [] };
  // poll s3 until the number of converted objects equals the number of segmented objects
  do {
    s3Res = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: transcodeDestinationPath })
      .promise();
    console.log(`${preset}: ${s3Res.Contents.length}/${segmentedItems.length}`);
    await sleep(3000);
  } while (s3Res.Contents.length < segmentedItems.length);

  console.log('transcode complete!');
})();
