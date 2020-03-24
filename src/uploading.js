const AWS = require('aws-sdk');
const { exec } = require('child_process');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const uploadsQueueUrl =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev';
const transcodingQueueUrl =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

const main = async () => {
  try {
    const { Messages } = await sqs
      .receiveMessage({ QueueUrl: uploadsQueueUrl })
      .promise();

    if (Messages) {
      for (const { Body, ReceiptHandle } of Messages) {
        const { Records } = JSON.parse(Body);
        if (Records) {
          for (const record of Records) {
            const bucket = record.s3.bucket.name;
            const [, videoId, filename] = record.s3.object.key.split('/');
            const segmentationCmd = [
              'nomad job dispatch -detach',
              `-meta "filename=${filename}"`,
              `-meta "video_id=${videoId}"`,
              `-meta "bucket=${bucket}"`,
              `-meta "transcode_queue_url=${transcodingQueueUrl}"`,
              'segmenting',
            ];
            exec(segmentationCmd.join(' '), (error, stdout) => {
              if (error) throw new Error(error);
              console.log(stdout);
            });
          }
        }
        await sqs
          .deleteMessage({ QueueUrl: uploadsQueueUrl, ReceiptHandle })
          .promise();
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

setInterval(() => {
  main();
}, 1000 * 10);
