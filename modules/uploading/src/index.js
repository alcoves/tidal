const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({ region: 'us-east-1' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const getPresets = require('./lib/getPresets');
const parseMetadata = require('./lib/parseMetadata');

module.exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 2));

  for (const { body } of event.Records) {
    const { Records } = JSON.parse(body);
    for (const { s3 } of Records) {
      const bucket = s3.bucket.name;
      const videoId = s3.object.key.split('/')[1];
      const filename = s3.object.key.split('/')[2];

      const metadataRes = await lambda
        .invoke({
          InvocationType: 'RequestResponse',
          FunctionName: process.env.METADATA_FN_NAME,
          Payload: Buffer.from(
            JSON.stringify({
              in_path: `s3://${bucket}/uploads/${videoId}/${filename}`,
            })
          ),
        })
        .promise();

      const { width, duration } = parseMetadata(metadataRes.Payload);
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

      await Promise.all([
        await lambda
          .invoke({
            InvocationType: 'Event',
            FunctionName: process.env.SEGMENTER_FN_NAME,
            Payload: Buffer.from(JSON.stringify({ videoId, filename })),
          })
          .promise(),
        await lambda
          .invoke({
            InvocationType: 'Event',
            FunctionName: process.env.THUMBNAILER_FN_NAME,
            Payload: Buffer.from(
              JSON.stringify({
                in_path: `s3://${bucket}/uploads/${videoId}/${filename}`,
              })
            ),
          })
          .promise(),
        lambda
          .invoke({
            InvocationType: 'Event',
            FunctionName: process.env.AUDIO_EXTRACTOR_FN_NAME,
            Payload: Buffer.from(
              JSON.stringify({
                presets,
                ffmpeg_cmd: `-vn -c:a libopus -f opus`,
                out_path: `/mnt/tidal/audio/${videoId}/source.ogg`,
                in_path: `s3://${bucket}/uploads/${videoId}/${filename}`,
              })
            ),
          })
          .promise(),
        lambda
          .invoke({
            InvocationType: 'Event',
            FunctionName: process.env.AUDIO_EXTRACTOR_FN_NAME,
            Payload: Buffer.from(
              JSON.stringify({
                presets,
                ffmpeg_cmd: `-vn -c:a aac`,
                out_path: `/mnt/tidal/audio/${videoId}/source.aac`,
                in_path: `s3://${bucket}/uploads/${videoId}/${filename}`,
              })
            ),
          })
          .promise(),
      ]);
    }
  }
};
