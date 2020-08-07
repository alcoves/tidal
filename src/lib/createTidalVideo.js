const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

module.exports = function createTidalVideo({
  id,
  presets,
  duration,
  framerate,
}) {
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

  return db
    .put({
      TableName: 'tidal',
      Item: {
        id,
        duration,
        versions,
        framerate,
        status: 'segmenting',
        videoSegmentsCount: 0,
        thumbnail: 'https://cdn.bken.io/static/default-thumbnail-sm.jpg',
      },
    })
    .promise();
};
