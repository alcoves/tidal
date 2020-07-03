const AWS = require('aws-sdk');
const axios = require('axios');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });
const TIDAL_TABLE = process.env.TIDAL_TABLE;

module.exports.handler = async function (event) {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const folder = record.s3.object.key.split('/')[0];

    if (folder === 'audio') {
      const [, id] = record.s3.object.key.split('/');

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
                ':path': record.s3.object.key,
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
      console.log('segment', { id, preset, segment });

      if (preset === 'source') {
        const { Items } = await db
          .query({
            TableName: TIDAL_TABLE,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
          })
          .promise();

        console.log('enqueuing transcoding job');
        await Promise.all(
          Items.map(async ({ cmd, preset }) => {
            // TODO :: Use environment variable once nomad servers are tracked in tf
            const nomadAddr =
              'http://10.0.3.87:4646/v1/job/transcoding/dispatch';

            const { Item } = await db
              .get({
                TableName: 'config',
                Key: { id: 'NOMAD_TOKEN' },
              })
              .promise();

            return axios.post(
              nomadAddr,
              {
                Meta: {
                  cmd,
                  s3_in: `s3://${bucket}/segments/${id}/source/${segment}`,
                  s3_out: `s3://${bucket}/segments/${id}/${preset}/${segment}`,
                },
              },
              {
                headers: {
                  'X-Nomad-Token': Item.value,
                },
              }
            );
          })
        );
      } else {
        await db
          .update({
            Key: { id, preset },
            TableName: TIDAL_TABLE,
            UpdateExpression: 'SET #segments.#segName = :status',
            ExpressionAttributeValues: { ':status': true },
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
