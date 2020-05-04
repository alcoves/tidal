const BUCKET = 'tidal-bken-dev';
const TRANSCODING_QUEUE_URL =
  'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev';

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });

module.exports = async (event) => {
  const { presets, videoId, metadata } = event;

  const segments = await s3ls({
    Bucket: BUCKET,
    Prefix: `segments/source/${videoId}/`,
  });

  await concatOddSegment(segments);

  for (let i = 0; i < segments.length; i++) {
    const { Key } = segments[i];
    const segName = Key.split('/').pop();
    console.log('segment key', Key);
    console.log('segName', segName);
    const messages = presets.map(({ presetName, ffmpegCmdStr }) => {
      return {
        QueueUrl: TRANSCODING_QUEUE_URL,
        MessageBody: JSON.stringify({
          ffmpeg_cmd: ffmpegCmdStr,
          in_path: `s3://${BUCKET}/segments/source/${videoId}/${segName}`,
          out_path: `s3://${BUCKET}/segments/transcoded/${videoId}/${presetName}/1/${segName}`,
        }),
      };
    });

    Promise.all(
      messages.map((m) => {
        console.log('sending sqs message');
        sqs.sendMessage(m).promise();
      })
    )
      .then(() => {
        console.log('segment upload success');
      })
      .catch((error) => {
        console.error('failed to send message to sqs');
        throw error;
      });
  }
};
