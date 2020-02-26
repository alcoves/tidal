const AWS = require('aws-sdk');
const { fork } = require('child_process');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const { listenQueueUrl } = require('yargs').argv;
if (!listenQueueUrl) throw new Error('listenQueueUrl is required');

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
      QueueUrl: listenQueueUrl,
      MaxNumberOfMessages: 1,
    })
    .promise();

  const message = Messages ? Messages[0] : null;

  if (message) {
    try {
      const runParams = Object.entries(JSON.parse(message.Body)).reduce(
        (acc, [key, value]) => {
          acc.push(`--${key}=${value}`);
          return acc;
        },
        []
      );

      console.log('starting pipeline', runParams);
      await run('./src/index.js', runParams);
      await sqs
        .deleteMessage({
          QueueUrl: listenQueueUrl,
          ReceiptHandle: message.ReceiptHandle,
        })
        .promise();
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
