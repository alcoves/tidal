const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const concatCheck = require('./lib/concatCheck');

const s3 = new AWS.S3({ region: 'us-east-2' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out, ffmpegCmd) {
  console.log({ s3In, s3Out, ffmpegCmd });

  console.log('parsing variables');
  const [, , bucket, , videoId, presetName, videoFileName] = s3Out.split('/');
  console.log({ bucket, videoId, presetName, videoFileName });

  console.log('creating tmpDir');
  const tmpDir = fs.mkdtempSync('/tmp/');
  const tmpVideoPath = `${tmpDir}/${videoFileName}`;
  console.log({ tmpDir, tmpVideoPath });

  console.log('creating signed source url');
  const signedSourceUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: s3In.replace(`s3://${bucket}/`, ''),
  });

  console.log('transcoding video');
  await bash(`ffmpeg -y -i ${signedSourceUrl} ${ffmpegCmd} ${tmpVideoPath}`);

  console.log('uploading video file to s3');
  await bash(`aws s3 mv ${tmpVideoPath} ${s3Out} --quiet`);

  console.log('updating tidal database');
  await db
    .update({
      TableName: 'tidal',
      Key: { id: videoId },
      ExpressionAttributeValues: { ':val': 1 },
      ExpressionAttributeNames: { '#preset': presetName },
      UpdateExpression:
        'set versions.#preset.videoSegmentsCompleted = versions.#preset.videoSegmentsCompleted + :val',
    })
    .promise();

  console.log('checking if concatination should occur');
  await concatCheck(videoId);

  console.log('video transcoding complete');
}

const inPath = process.argv[2];
const outPath = process.argv[3];
const cmd = process.argv[4];

if (!inPath || !outPath || !cmd) {
  throw new Error('invalid input arguments');
}

main(inPath, outPath, cmd);
