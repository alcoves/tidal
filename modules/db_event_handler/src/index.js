const AWS = require('aws-sdk');
const dispatchJob = require('./lib/dispatchJob');
const obtainDbLock = require('./lib/obtainDbLock');

const { CDN_BUCKET, TIDAL_BUCKET } = process.env;

module.exports.handler = async ({ Records }) => {
  for (const event of Records) {
    console.log(JSON.stringify(event));
    const video = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);

    for (const version of video.versions) {
      if ((version.status === 'segmenting') && (version.segmentsCompleted === video.segmentCount) && (Object.keys(video.audio).length >= 2)) {
        if (await obtainDbLock(version.preset)) {
          await dispatchJob('concatinating', {
            s3_in: `s3://${TIDAL_BUCKET}/segments/${video.id}/${version.preset}`,
            s3_out: `s3://${CDN_BUCKET}/v/${video.id}/${version.preset}.${video.ext}`,
          });
        }
      }
    }
  }
};
