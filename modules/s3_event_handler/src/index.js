const AWS = require('aws-sdk');
const axios = require('axios');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TIDAL_TABLE = process.env.TIDAL_TABLE;

module.exports.handler = async function (event) {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const folder = record.s3.object.key.split('/')[0];

    if (folder === 'audio') {
      console.log('audio file uploaded');
      const { Items } = await db
        .query({
          TableName: TIDAL_TABLE,
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: { ':id': id },
        })
        .promise();

      await Promise.all(
        Items.map(({ id, preset }) => {
          return db
            .update({
              Key: { id, preset },
              TableName: TIDAL_TABLE,
              UpdateExpression: 'SET #audio.#audioExt = :path',
              ExpressionAttributeValues: {
                ':path': { S: record.s3.object.key },
              },
              ExpressionAttributeNames: {
                // TODO :: Probably unreliable way of getting extension
                '#audioExt': record.s3.object.key.split('.')[1],
                '#audio': 'audio',
              },
            })
            .promise();
        })
      );
    }

    if (folder === 'segments') {
      const [, id, preset, segment] = record.s3.object.key.split('/');

      if (preset === 'source') {
        const { Items } = await db
          .query({
            TableName: TIDAL_TABLE,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
          })
          .promise();

        await Promise.all(
          Items.map(({ cmd, preset }) => {
            // TODO :: Use environment variable once nomad servers are tracked in tf
            const nomadAddr = '172.31.87.53/v1/job/transcoding/dispatch';
            return axios.post(nomadAddr, {
              Meta: {
                cmd,
                s3_in: `s3://${bucket}/segments/${id}/source/${segment}`,
                s3_out: `s3://${bucket}/segments/${id}/${preset}/${segment}`,
              },
            });
          })
        );
      } else {
        await db
          .update({
            Key: { id, preset },
            TableName: TIDAL_TABLE,
            UpdateExpression: 'SET #segments.#segName = :status',
            ExpressionAttributeValues: { ':status': { BOOL: true } },
            ExpressionAttributeNames: {
              '#segName': segment,
              '#segments': 'segments',
            },
          })
          .promise();
      }
    }
  }
};
