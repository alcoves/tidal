const getSafeEnv = require('./lib/getSafeEnv');
const { SCRIPT_PREFIX } = getSafeEnv(['SCRIPT_PREFIX']);

const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const dispatchJob = require('./lib/dispatchJob');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out, ffmpegCmd) {
  console.log({ s3In, s3Out, ffmpegCmd });

  console.log('parsing variables');

  console.log('creating tmpfile');

  console.log('creating signed source url');

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
