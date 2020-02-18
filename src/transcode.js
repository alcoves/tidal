const _ = require('lodash');
const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

const sleep = (t) => new Promise((r) => setTimeout(() => r(), t));

const {
  bucket,
  ffmpegCmdStr,
  segmentSourcePath,
  transcodeDestinationPath,
} = require('yargs').argv;

if (!bucket) throw new Error('bucket must be defined');
if (!ffmpegCmdStr) throw new Error('ffmpegCmdStr must be defined');
if (!segmentSourcePath) throw new Error('segmentSourcePath must be defined');
if (!transcodeDestinationPath)
  throw new Error('transcodeDestinationPath must be defined');

(async () => {
  console.log('reading segments');
  const { Contents: segments } = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: segmentSourcePath,
    })
    .promise();

  console.log('enqueuing messages');
  for (const batch of _.chunk(segments, 10)) {
    console.log('sending batch message to sqs');
    await sqs
      .sendMessageBatch({
        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/594206825329/conversion',
        Entries: batch.map(({ Key }) => {
          console.log('Key', Key);
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
    console.log(`${s3Res.Contents.length}/${segmentedItems.length}`);
    await sleep(3000);
  } while (s3Res.Contents.length < segmentedItems.length);

  console.log('transcode complete!');
  process.send('transcode complete!');
})();
