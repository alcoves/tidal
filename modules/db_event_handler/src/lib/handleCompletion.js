const AWS = require('aws-sdk');

const { TIDAL_TABLE } = process.env;
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

module.exports = async function (oldImage, newImage) {
  if (newImage.versions) {
    const versions = Object.values(newImage.versions);

    const shouldSetCompletedStatus = versions.reduce((acc, cv) => {
      if (cv.status !== 'completed') acc = false;
      return acc;
    }, true);

    if (shouldSetCompletedStatus) {
      try {
        console.log(`setting ${newImage.id} status to completed`);
        await db
          .update({
            TableName: TIDAL_TABLE,
            Key: { id: newImage.id },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeValues: { ':status': 'completed' },
            ExpressionAttributeNames: {
              '#status': 'status',
            },
          })
          .promise();
      } catch (error) {
        console.error(error);
      }
    }
  }
};
