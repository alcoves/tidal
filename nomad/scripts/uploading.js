const AWS = require('aws-sdk');
const exec = require('child_process');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const uploadsQueueUrl =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev';
const transcodingQueueUrl =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

(async () => {
  try {
    const { Messages } = await sqs
      .receiveMessage({ QueueUrl: uploadsQueueUrl })
      .promise();
    for (const { Body, ReceiptHandle } of Messages) {
      const { Records } = JSON.parse(Body);
      for (const record of Records) {
        const bucket = record.s3.bucket.name;
        const [, videoId, filename] = record.s3.object.key.split('/')[1];

        // nomad job dispatch -detach \
        //   -meta "video_id=test" \
        //   -meta "filename=source.mp4" \
        //   -meta "bucket=tidal-bken-dev" \
        //   -meta "transcode_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev" \
        //   concatinating

        const segmentationCmd = [
          'nomad job dispatch -detach',
          `-meta "filename=${filename}"`,
          `-meta "video_id=${videoId}"`,
          `-meta "bucket=${bucket}"`,
          `-meta "transcode_queue_url=${transcodingQueueUrl}"`,
        ];

        exec(segmentationCmd.join('\\'), (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });

        // exec(nomadCommand.join('\\'), (error, stdout, stderr) => {
        //   if (error) {
        //     console.error(`exec error: ${error}`);
        //     return;
        //   }
        //   console.log(`stdout: ${stdout}`);
        //   console.log(`stderr: ${stderr}`);
        // });
      }

      await sqs
        .deleteMessage({ QueueUrl: uploadsQueueUrl, ReceiptHandle })
        .promise();
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
