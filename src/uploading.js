const AWS = require('aws-sdk');
const axios = require('axios');

const sqs = new AWS.SQS({ region: 'us-east-1' });

const githubAccessToken = process.env.GITHUB_ACCESS_TOKEN
const wasabiAccessKeyId = process.env.WASABI_ACCESS_KEY_ID
const wasabiSecretAcessKey = process.env.WASABI_SECRET_ACCESS_KEY

const {
  tableName,
  uploadsQueueUrl,
  transcodingQueueUrl
} = require('yargs').argv;

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

            const res = await axios.post(`http://${process.env.NOMAD_IP_host}:4646/v1/job/concatinating/dispatch`, {
              Meta: {
                bucket,
                filename,
                video_id: videoId,
                table_name: tableName,
                github_access_token: githubAccessToken,
                wasabi_access_key_id: wasabiAccessKeyId,
                transcoding_queue_url: transcodingQueueUrl,
                wasabi_secret_access_key: wasabiSecretAcessKey
              }
            })
            console.log(res.body);
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
