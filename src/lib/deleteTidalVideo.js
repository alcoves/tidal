const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

module.exports = function deleteTidalVideo(id) {
  return db
    .delete({
      TableName: 'tidal',
      Key: { id },
    })
    .promise();
};
