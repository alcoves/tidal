const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const chunk = require('./chunk');

AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS();

module.exports = async (segments, presets, Bucket) => {
  const messages = segments.reduce((acc, { Key }) => {
    presets.map(({ presetName, ffmpegCmdStr }) => {
      acc.push({
        Id: uuid(),
        MessageBody: JSON.stringify({
          ffmpegCommand: ffmpegCmdStr,
          inPath: `${Bucket}/${Key}`,
          outPath: `${Bucket}/transcoded-segments/${presetName}/${Key.split('/').pop()}`,
        }),
      })
    })
    return acc;
  }, [])

  const batchedMessages = chunk(messages, 10).reduce((acc, batchOfTen) => {
    acc.push({ QueueUrl: process.env.ENCODING_QUEUE_URL, Entries: batchOfTen })
    return acc;
  }, [])

  return Promise.all(batchedMessages.map((msgBatch) => sqs.sendMessageBatch(msgBatch).promise()))
}