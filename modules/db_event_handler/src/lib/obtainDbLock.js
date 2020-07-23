const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });
const TIDAL_TABLE = process.env.TIDAL_TABLE;

module.exports = async function ({ preset }) {
  try {
    await db
      .update({
        Key: { id },
        TableName: TIDAL_TABLE,
        ConditionExpression: `#versions.#preset.#status = :segmenting`,
        UpdateExpression: 'set #versions.#preset.#status = :concatinating',
        ExpressionAttributeValues: { ':segmenting': 'segmenting', ':concatinating': 'concatinating' },
        ExpressionAttributeNames: {
          '#preset': preset,
          '#versions': 'versions',
          '#status': 'concatinating',
        },
      })
      .promise();
    return true
  } catch (error) {
    return false
  }
}