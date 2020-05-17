const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });
const sqs = new AWS.SQS({ region: 'us-east-1' });

const genManifest = require('./genManifest');

const { v4: uuidv4 } = require('uuid');
const {
  Bucket,
  transcodingQueueUrl,
} = require('../../segmenting/src/config/config');

const chunk = (arr, chunkSize = 1, cache = []) => {
  const tmp = [...arr];
  if (chunkSize <= 0) return cache;
  while (tmp.length) cache.push(tmp.splice(0, chunkSize));
  return cache;
};

module.exports = async (segments, presets, videoId) => {
  console.log(
    `enqueue ${segments.length} segments and ${presets.length} presets`
  );

  const manifests = presets.map(({ presetName }) => {
    return {
      Bucket,
      Body: JSON.stringify(genManifest(presetName, segments)),
      Key: `segments/transcoded/${videoId}/${presetName}.json`,
    };
  });

  console.log('uploading manifests');
  await Promise.all(
    manifests.map((params) => {
      return s3.upload(params).promise();
    })
  );

  const requests = presets.reduce((acc, { presetName, ffmpegCmdStr }) => {
    segments.map(({ Key }) => {
      const segmentName = Key.split('/').pop();
      acc.push({
        Id: uuidv4(),
        MessageBody: JSON.stringify({
          ffmpeg_cmd: ffmpegCmdStr,
          in_path: `s3://${Bucket}/segments/source/${videoId}/${segmentName}`,
          out_path: `s3://${Bucket}/segments/transcoded/${videoId}/${presetName}/1/${segmentName}`,
        }),
      });
    });
    return acc;
  }, []);

  console.log('number of requests', requests.length);

  for (const Entries of chunk(requests, 10)) {
    console.log('enqueuing message batch');
    await sqs
      .sendMessageBatch({
        Entries,
        QueueUrl: transcodingQueueUrl,
      })
      .promise();
  }
};
