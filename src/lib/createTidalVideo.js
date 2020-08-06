const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function putVideo({ id, presets, duration, framerate }) {
  await db
    .delete({
      Key: { id },
      TableName: 'tidal',
    })
    .promise();

  const versions = presets.reduce((acc, { preset, cmd, ext }) => {
    acc[preset] = {
      ext,
      cmd,
      preset,
      link: null,
      status: 'segmenting',
      audioProcessed: false,
      videoSegmentsCompleted: 0,
    };
    return acc;
  }, {});

  await db
    .put({
      TableName: 'tidal',
      Item: {
        id,
        duration,
        versions,
        framerate,
        status: 'segmenting',
        videoSegmentCount: 0,
        thumbnail: 'https://cdn.bken.io/static/default-thumbnail-sm.jpg',
      },
    })
    .promise();
}

module.exports = putVideo;
