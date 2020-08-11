const AWS = require('aws-sdk');
const getSafeEnv = require('./getSafeEnv');
const dispatchJob = require('./dispatchJob');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

module.exports = async function checkConcat(videoId) {
  const { SCRIPT_PREFIX } = getSafeEnv(['SCRIPT_PREFIX']);

  const { Item: video } = await db
    .get({
      TableName: 'tidal',
      Key: { id: videoId },
    })
    .promise();

  for (const version of Object.values(video.versions)) {
    console.log('version.audioProcessed', version.audioProcessed);
    console.log('video.videoSegmentsCount', video.videoSegmentsCount);
    console.log(
      'version.videoSegmentsCompleted',
      version.videoSegmentsCompleted
    );

    if (
      version.audioProcessed &&
      version.videoSegmentsCompleted === video.videoSegmentsCount
    ) {
      console.log('the video is ready to be concatinated!');
      await db
        .update({
          TableName: 'tidal',
          Key: { id: videoId },
          ExpressionAttributeValues: { ':val': 'concatinating' },
          UpdateExpression: 'set versions.#preset.#status = :val',
          ExpressionAttributeNames: {
            '#status': 'status',
            '#preset': version.preset,
          },
        })
        .promise();

      // await dispatchJob('concatinating', {
      //   s3_in: '',
      //   s3_out: '',
      //   script_path: `${SCRIPT_PREFIX}/`,
      //   // Add audio in
      // });
    }
  }
};
