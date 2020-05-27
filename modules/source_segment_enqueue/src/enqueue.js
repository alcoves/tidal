const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const TIDAL_TRANSCODING_QUEUE_URL =
  process.env.TIDAL_TRANSCODING_QUEUE_URL ||
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

const chunk = (arr, chunkSize = 1, cache = []) => {
  const tmp = [...arr];
  if (chunkSize <= 0) return cache;
  while (tmp.length) cache.push(tmp.splice(0, chunkSize));
  return cache;
};

module.exports = async (requests) => {
  console.log('number of requests', requests.length);
  for (const Entries of chunk(requests, 10)) {
    await sqs
      .sendMessageBatch({ Entries, QueueUrl: TIDAL_TRANSCODING_QUEUE_URL })
      .promise();
  }
};
