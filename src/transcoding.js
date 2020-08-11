const getSafeEnv = require('./lib/getSafeEnv');
const { SCRIPT_PREFIX } = getSafeEnv(['SCRIPT_PREFIX']);

const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const dispatchJob = require('./lib/dispatchJob');

const s3 = new AWS.S3({ region: 'us-east-2' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out, ffmpegCmd) {
  console.log({ s3In, s3Out, ffmpegCmd });

  console.log('parsing variables');
  // s3://tidal-bken/audio/test/preset/source.ogg
  const [, , bucket, , videoId, presetName, audioFileName] = s3Out.split('/');
  console.log({ bucket, videoId, presetName, audioFileName });

  console.log('parsing extension name');
  const audioExtension = path.extname(s3Out);

  console.log('creating tmpfile');
  const tmpFile = await fs.mkdtemp();

  console.log('creating signed source url');
  const signedSourceUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: s3In.replace(`s3://${bucket}`, ''),
  });

  console.log('transcoding audio');

  console.log('uploading audio file to s3');

  console.log('updating tidal database');

  console.log('checking if concatination should occur');

  console.log('audio transcoding complete');
}

const inPath = process.argv[2];
const outPath = process.argv[3];
const cmd = process.argv[4];

if (!inPath || !outPath || !cmd) {
  throw new Error('invalid input arguments');
}

main(inPath, outPath, cmd);
