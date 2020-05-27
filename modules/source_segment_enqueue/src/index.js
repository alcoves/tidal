const AWS = require('aws-sdk');
const enqueue = require('./enqueue');
const { v4: uuidv4 } = require('uuid');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const TIDAL_TABLE = process.env.TIDAL_TABLE || 'tidal-dev';
const TIDAL_BUCKET = process.env.TIDAL_BUCKET || 'tidal-bken-dev';

module.exports.handler = async function (event) {
  console.log(JSON.stringify(event));
  const requests = [];

  await Promise.all(
    event.Records.map(async (record) => {
      const [, , id, segmentName] = record.s3.object.key.split('/');
      const { Items } = await db
        .query({
          TableName: TIDAL_TABLE,
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: { ':id': id },
        })
        .promise();

      console.log('id', id);
      console.log('Items', Items);
      Items.map(({ cmd, preset }) => {
        requests.push({
          Id: uuidv4(),
          MessageBody: JSON.stringify({
            ffmpeg_cmd: cmd,
            in_path: `s3://${TIDAL_BUCKET}/segments/source/${id}/${segmentName}`,
            out_path: `s3://${TIDAL_BUCKET}/segments/transcoded/${id}/${preset}/${segmentName}`,
          }),
        });
      });
    })
  );

  console.log('requests', requests);
  await enqueue(requests);
};
