const getSafeEnv = require('./lib/getSafeEnv');
const { SCRIPT_PREFIX } = getSafeEnv(['SCRIPT_PREFIX']);

const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const dispatchJob = require('./lib/dispatchJob');

const ssm = new AWS.SSM({ region: 'us-east-2' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out) {
  console.log('creating tmp directories');
  const tmpDir = fs.mkdtempSync('/tmp/');
  const tmpAudioDir = `${tmpDir}/audio`;
  const tmpSegmentDir = `${tmpDir}/segments`;
  fs.mkdirpSync(tmpAudioDir);
  fs.mkdirpSync(tmpSegmentDir);

  try {
    console.log({ s3In, s3Out });

    console.log('parsing variables');
    const [, , bucket, , videoId, presetName] = s3In.split('/');
    const [, , wasabiBucket] = s3In.split('/');
    const videoExtension = path.extname(s3Out);
    const localVideoPath = `${tmpDir}/${presetName}${videoExtension}`;
    console.log({
      bucket,
      videoId,
      presetName,
      wasabiBucket,
      videoExtension,
      localVideoPath,
    });

    console.log('creating manifest');
    const manifestPath = `${tmpDir}/manifest.txt`;

    console.log('downloading segments');
    await bash(`aws s3 sync ${inPath} ${tmpSegmentDir} --quiet`);

    console.log('writing segments to manifest');
    for (const segment of await fs.readdir(tmpSegmentDir)) {
      await fs.appendFile(manifestPath, `file '${tmpSegmentDir}/${segment}'`);
    }

    console.log('deciding which audio to use');
    const audioExt = videoExtension === '.webm' ? 'ogg' : 'aac';
    console.log('audioExt', audioExt);

    const remoteAudio = `s3://${bucket}/audio/${videoId}/${presetName}/source.${audioExt}`;
    console.log('remoteAudio', remoteAudio);

    const localAudioPath = `${tmpAudioDir}/source.${audioExt}`;
    console.log('localAudioPath', localAudioPath);

    console.log('downloading audio');
    await bash(`aws s3 cp ${remoteAudio} ${localAudioPath} --quiet`);

    console.log('concatinating video');
    const ffmpegCmd = [
      'ffmpeg',
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      manifestPath,
      '-c',
      'copy',
      '-f',
      'matroska - |',
      'ffmpeg',
      '-y',
      '-i',
      '-',
      '-i',
      localAudioPath,
      '-c',
      'copy',
      '-movflags',
      'faststart',
      localVideoPath,
    ];

    console.log('ffmpegCmd', ffmpegCmd.join(' '));
    await bash(ffmpegCmd.join(' '));

    // this could be a separate "publishing" job
    // console.log('getting wasabi access keys');
    const {
      Parameter: { Value: wasabiAccessKeyId },
    } = await ssm.getParameter({ Name: 'wasabi_access_key_id' }).promise();

    const {
      Parameter: { Value: wasabiSecretAccessKey },
    } = await ssm.getParameter({ Name: 'wasabi_secret_access_key' }).promise();

    console.log({ wasabiAccessKeyId, wasabiSecretAccessKey });

    // console.log('copying to wasabi');

    // console.log('updating tidal database with status');

    // console.log('concatinating completed');
    await fs.remove(tmpDir);
  } catch (error) {
    await fs.remove(tmpDir);

    console.error(error);
    throw error;
  }
}

const inPath = process.argv[2];
const outPath = process.argv[3];

if (!inPath || !outPath) {
  throw new Error('invalid input arguments');
}

main(inPath, outPath);
