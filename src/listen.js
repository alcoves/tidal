const AWS = require('aws-sdk');
const { fork } = require('child_process');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const { sqsQueueUrl } = require('yargs').argv;
if (!sqsQueueUrl) throw new Error('sqsQueueArn is required');

const INTERVAL = 1000;
let PROCESSING = false;

const run = (scriptPath, forkArgs = []) => {
  return new Promise((resolve, reject) => {
    const process = fork(scriptPath, forkArgs);
    process.on('error', reject);
    process.on('exit', resolve);
    process.on('message', resolve);
  });
};

const processEvent = async () => {
  PROCESSING = true;

  const { Messages } = await sqs
    .receiveMessage({
      QueueUrl: sqsQueueUrl,
      MaxNumberOfMessages: 1,
    })
    .promise();

  const message = Messages ? Messages[0] : null;

  if (message) {
    try {
      const { videoId, sourceFileName, bucket } = JSON.parse(message.Body);
      if (videoId && sourceFileName && bucket) {
        console.log('starting pipeline');
        await run('./src/index.js', [
          `--bucket=${bucket}`,
          `--videoId=${videoId}`,
          `--sourceFileName=${sourceFileName}`,
        ]);
        const res = await sqs
          .deleteMessage({
            QueueUrl: sqsQueueUrl,
            ReceiptHandle: message.ReceiptHandle,
          })
          .promise();
      }
    } catch (error) {
      console.error(error);
    }
  }

  PROCESSING = false;
};

(async () => {
  console.log('listening for events');
  setInterval(() => {
    if (!PROCESSING) processEvent();
  }, INTERVAL);
})();
