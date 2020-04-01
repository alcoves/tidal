const AWS = require('aws-sdk');
const { exec } = require('child_process');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const tableName = process.TABLE_NAME
const uploadsQueueUrl = process.env.UPLOADS_QUEUE_URL
const transcodingQueueUrl = process.env.TRANSCODING_QUEUE_URL

const main = async () => {
  try {
    console.log('fetching messages...');
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
              `-meta "table_name=${tableName}"`,
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
