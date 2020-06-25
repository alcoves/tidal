const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const getPresets = require('./lib/getPresets');
const dispatchJob = require('./lib/dispatchJob');
const getMetadata = require('./lib/getMetadata');

const { WASABI_BUCKET } = process.env;

module.exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 2));

  for (const { s3 } of event.Records) {
    const bucket = s3.bucket.name;
    const videoId = s3.object.key.split('/')[1];
    const filename = s3.object.key.split('/')[2];
    const sourceS3Path = `s3://${bucket}/uploads/${videoId}/${filename}`;

    const { width, duration } = await getMetadata(sourceS3Path);
    const presets = getPresets(width);

    await Promise.all(
      presets.map(async ({ preset, cmd, ext }) => {
        await db
          .delete({
            TableName: 'tidal-dev',
            Key: { id: videoId, preset },
          })
          .promise();

        await db
          .put({
            TableName: 'tidal-dev',
            Item: {
              cmd,
              ext,
              preset,
              duration,
              audio: {},
              id: videoId,
              segments: {},
              status: 'segmenting',
            },
          })
          .promise();
      })
    );

    await dispatchJob('audio', {
      cmd: '-vn -c:a aac',
      s3_in: sourceS3Path,
      s3_out: `s3://${bucket}/audio/${videoId}/source.aac`,
    });

    await dispatchJob('audio', {
      cmd: '-vn -c:a libopus -f opus',
      s3_in: sourceS3Path,
      s3_out: `s3://${bucket}/audio/${videoId}/source.ogg`,
    });

    // await dispatchJob('thumbnail', {
    //   cmd: '-s 640x360 -vframes 1 -q:v 40',
    //   s3_in: sourceS3Path,
    //   s3_out: `s3://${WASABI_BUCKET}/i/${videoId}/default.webp`,
    // });

    // await dispatchJob('segmentation', {
    //   cmd: '-s 640x360 -vframes 1 -q:v 40',
    //   s3_in: sourceS3Path,
    //   s3_out: `s3://${WASABI_BUCKET}/i/${videoId}/default.webp`,
    // });
  }
};
