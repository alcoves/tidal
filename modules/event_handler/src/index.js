const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const TIDAL_BUCKET = process.env.TIDAL_BUCKET || 'tidal-bken-dev';
const TIDAL_CONCAT_QUEUE_URL = process.env.TIDAL_CONCAT_QUEUE_URL || '';

module.exports.handler = async ({ Records }) => {
  for (const event of Records) {
    console.log(JSON.stringify(event));
    const item = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);

    if (item.status === 'segmenting') {
      const { transcoded, transcoding } = Object.values(item.segments).reduce(
        (acc, cv) => {
          cv ? acc.transcoded++ : acc.transcoding++;
          return acc;
        },
        { transcoded: 0, transcoding: 0 }
      );

      if (transcoded && !transcoding && Object.keys(item.audio).length >= 2) {
        // TODO :: Could directly invoke lambda instead of using a queue, better retry handling
        await sqs
          .sendMessage({
            MessageBody: JSON.stringify({
              in_path: `s3://${TIDAL_BUCKET}/segments/transcoded/${item.id}/${item.preset}/`,
              out_path: `s3://${TIDAL_BUCKET}/transcoded/${item.id}/${item.preset}.${item.ext}`,
            }),
            QueueUrl: TIDAL_CONCAT_QUEUE_URL,
          })
          .promise();
      }
    }
  }
};
