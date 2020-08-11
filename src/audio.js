const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const concatCheck = require('./lib/concatCheck');

const s3 = new AWS.S3({ region: 'us-east-2' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out, ffmpegCmd) {
  console.log({ s3In, s3Out, ffmpegCmd });

  console.log('parsing variables');
  const [, , bucket, , videoId, presetName, audioFileName] = s3Out.split('/');
  console.log({ bucket, videoId, presetName, audioFileName });

  console.log('creating tmpDir');
  const tmpDir = fs.mkdtempSync('/tmp/');
  const tmpAudioPath = `${tmpDir}/${audioFileName}`;
  console.log({ tmpDir, tmpAudioPath });

  console.log('creating signed source url');
  const signedSourceUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: s3In.replace(`s3://${bucket}/`, ''),
  });

  console.log('transcoding audio');
  await bash(`ffmpeg -y -i ${signedSourceUrl} ${ffmpegCmd} ${tmpAudioPath}`);

  console.log('uploading audio file to s3');
  await bash(`aws s3 mv ${tmpAudioPath} ${s3Out} --quiet`);

  console.log('updating tidal database');
  await db
    .update({
      TableName: 'tidal',
      Key: { id: videoId },
      ExpressionAttributeValues: { ':true': true },
      ExpressionAttributeNames: { '#preset': presetName },
      UpdateExpression: 'set versions.#preset.audioProcessed = :true',
    })
    .promise();

  console.log('checking if concatination should occur');
  await concatCheck(videoId);

  console.log('audio transcoding complete');
}

const inPath = process.argv[2];
const outPath = process.argv[3];
const cmd = process.argv[4];

if (!inPath || !outPath || !cmd) {
  throw new Error('invalid input arguments');
}

main(inPath, outPath, cmd);
