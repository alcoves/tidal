const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });
const TIDAL_TABLE = process.env.TIDAL_TABLE;

function updateAudio({ id, object }) {
  if (!id || !object) throw new Error('Undefined arguments');
  return db
    .update({
      Key: { id },
      TableName: TIDAL_TABLE,
      UpdateExpression: 'SET #audio.#audioExt = :path',
      ExpressionAttributeValues: {
        ':path': object.key,
      },
      ExpressionAttributeNames: {
        // TODO :: Probably unreliable way of getting extension
        '#audioExt': object.key.split('.')[1],
        '#audio': 'audio',
      },
    })
    .promise();
}

function updateSegmentStatus({ id, preset, segment, status = false }) {
  if (!id || !segment) throw new Error('Undefined arguments');
  return db
    .update({
      Key: { id },
      TableName: TIDAL_TABLE,
      UpdateExpression: 'SET #segments.#preset.#segName.#status = :status',
      ExpressionAttributeValues: { ':status': status },
      ExpressionAttributeNames: {
        '#preset': preset,
        '#segName': segment,
        '#status': "status",
        '#segments': 'segments',
        '#versions': 'versions',
      },
    })
    .promise();
}

module.exports = {
  updateAudio,
  updateSegmentStatus
}
