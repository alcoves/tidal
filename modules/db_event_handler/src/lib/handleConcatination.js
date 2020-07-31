const AWS = require('aws-sdk');
const dispatchJob = require('./dispatchJob');

const { CDN_BUCKET, TIDAL_BUCKET, TIDAL_TABLE } = process.env;
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

module.exports = async function (oldImage, newImage) {
  if (newImage.versions) {
    const versions = Object.values(newImage.versions);

    for (const version of versions) {
      const [oldVersion] = Object.values(oldImage.versions).filter((old) => {
        if (old.preset === version.preset) {
          return true;
        }
      });

      console.log(
        version.preset,
        oldVersion.segmentsCompleted === newImage.segmentCount - 1,
        version.segmentsCompleted === newImage.segmentCount
      );

      if (
        oldVersion.segmentsCompleted === newImage.segmentCount - 1 &&
        version.segmentsCompleted === newImage.segmentCount
      ) {
        try {
          console.log(`concatinating ${version.preset}`);
          await dispatchJob('concatinating', {
            s3_in: `s3://${TIDAL_BUCKET}/segments/${newImage.id}/${version.preset}`,
            s3_out: `s3://${CDN_BUCKET}/v/${newImage.id}/${version.preset}.${version.ext}`,
          });

          await db
            .update({
              Key: { id: newImage.id },
              TableName: TIDAL_TABLE,
              UpdateExpression:
                'set #versions.#preset.#status = :concatinating',
              ExpressionAttributeValues: { ':concatinating': 'concatinating' },
              ExpressionAttributeNames: {
                '#status': 'status',
                '#versions': 'versions',
                '#preset': version.preset,
              },
            })
            .promise();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
};
