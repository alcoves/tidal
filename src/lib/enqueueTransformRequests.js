const _ = require('lodash');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const getObjectKeys = require('./getObjectKeys');

AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS();

// TODO :: If remote segment path cound doesn't match local path count, error

module.exports = async ({
  bucket,
  ffmpegCmdStr,
  encodingQueueUrl,
  remoteSegmentPath,
  transcodeDestinationPath,
}) => {
  console.log('reading segments');
  const segments = await getObjectKeys({
    Bucket: bucket,
    Prefix: remoteSegmentPath,
  });

  console.log('enqueuing messages');
  for (const batch of _.chunk(segments, 10)) {
    await sqs
      .sendMessageBatch({
        QueueUrl: encodingQueueUrl,
        Entries: batch.map(({ Key }) => {
          const split = Key.split('/');
          const segName = split[split.length - 1];
          return {
            Id: uuid(),
            MessageBody: JSON.stringify({
              ffmpegCommand: ffmpegCmdStr,
              inPath: `${bucket}/${remoteSegmentPath}/${segName}`,
              outPath: `${bucket}/${transcodeDestinationPath}/${segName}`,
            }),
          };
        }),
      })
      .promise();
  }

  return transcodeDestinationPath;
};
