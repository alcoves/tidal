const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const { v4: uuidv4 } = require('uuid');
const { Bucket, transcodingQueueUrl } = require('./config/config');

const chunk = (arr, chunkSize = 1, cache = []) => {
  const tmp = [...arr];
  if (chunkSize <= 0) return cache;
  while (tmp.length) cache.push(tmp.splice(0, chunkSize));
  return cache;
};

module.exports = async (item) => {
  const { id, preset, segments, cmd } = item;

  const requests = Object.keys(segments).map((segName) => {
    return {
      Id: uuidv4(),
      MessageBody: JSON.stringify({
        ffmpeg_cmd: cmd,
        in_path: `s3://${Bucket}/segments/source/${id}/${segName}`,
        out_path: `s3://${Bucket}/segments/transcoded/${id}/${preset}/${segName}`,
      }),
    };
  });

  console.log('number of requests', requests.length);
  for (const Entries of chunk(requests, 10)) {
    console.log('enqueuing message batch');
    await sqs
      .sendMessageBatch({
        Entries,
        QueueUrl: transcodingQueueUrl,
      })
      .promise();
  }
};
