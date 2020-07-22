const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

const { TIDAL_ENV } = process.env;

async function putVideo({ id, presets, duration }) {
  await db
    .delete({
      Key: { id },
      TableName: `tidal-${TIDAL_ENV}`,
    })
    .promise();

  const versions = presets.reduce((acc, { preset, cmd, ext }) => {
    acc[preset] = {
      ext,
      cmd,
      link: null,
      status: 'segmenting'
    }
    return acc;
  }, {});

  await db.put({
    TableName: `tidal-${TIDAL_ENV}`,
    Item: {
      id,
      duration,
      versions,
      audio: {},
      segments: {},
      segmentCount: 0,
      status: 'segmenting',
    },
  }).promise();
}

module.exports = putVideo
