const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const getPresets = require('./lib/getPresets');
const dispatchJob = require('./lib/dispatchJob');
const getMetadata = require('./lib/getMetadata');

const { WASABI_BUCKET } = process.env;

module.exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 2));

  // TODO :: Create lambda that fires for uploads and is outside the vpc
  // This lambda will be the one spawning instances
  // await ec2.startInstances({ InstanceIds: ['i-0d692bffc7eaa36ed'] }).promise();

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
      s3_in: sourceS3Path,
      cmd: '-vn -c:a aac',
      s3_out: `s3://${bucket}/audio/${videoId}/source.aac`,
    });

    await dispatchJob('audio', {
      s3_in: sourceS3Path,
      cmd: '-vn -c:a libopus -f opus',
      s3_out: `s3://${bucket}/audio/${videoId}/source.ogg`,
    });

    await dispatchJob('thumbnail', {
      cmd: '-vf crop=854:480 -vframes 1 -q:v 40',
      s3_in: sourceS3Path,
      s3_out: `s3://${WASABI_BUCKET}/i/${videoId}/default.webp`,
    });

    await dispatchJob('segmenting', {
      s3_in: sourceS3Path,
      cmd: '-an -c:v copy -f segment -segment_time 10',
      s3_out: `s3://${bucket}/segments/${videoId}/source`,
    });
  }
};
