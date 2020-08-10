const getSafeEnv = require('./lib/getSafeEnv');
const { SCRIPT_PREFIX } = getSafeEnv(['SCRIPT_PREFIX']);

const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const bash = require('./lib/bash');
const dispatchJob = require('./lib/dispatchJob');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function main(s3In, s3Out, ffmpegCmd) {
  try {
    console.log('parsing inputs');
    const [, , bucket, , videoId, presetName] = s3Out.split('/');
    console.log({ bucket, videoId, presetName });

    console.log('creating tmp directories');
    const tmpDir = fs.mkdtempSync('/tmp/');
    const tmpSegmentDir = `${tmpDir}/segments`;
    fs.mkdirpSync(tmpSegmentDir);

    console.log('getting video extension');
    const videoExtension = path.extname(s3In);
    console.log({ videoExtension });

    const videoPath = `${tmpDir}/${videoId}${videoExtension}`;
    console.log({ videoPath });

    console.log('downloading video');
    await bash(`aws s3 cp ${s3In} ${videoPath} --quiet`);

    console.log('segmenting video');
    await bash(
      `ffmpeg -y -i ${videoPath} ${ffmpegCmd} ${tmpSegmentDir}/%0d${videoExtension}`
    );

    console.log('uploading segments');
    await bash(`aws s3 sync ${tmpSegmentDir} ${s3Out} --quiet`);
    console.log('segments uploaded successfully');

    console.log('reading segments from disk');
    const segments = await fs.readdir(tmpSegmentDir);
    console.log({ segments });

    console.log('getting video from tidal db');
    const { Item: video } = await db
      .get({
        TableName: 'tidal',
        Key: { id: videoId },
      })
      .promise();
    console.log('fetched video from tidal db', video);

    for (const version of Object.values(video.versions)) {
      console.log('version', version);

      if (version.ext === 'webm') {
        await dispatchJob('audio', {
          s3_in: s3In,
          cmd: '-vn -c:a libopus -f opus',
          script_path: `${SCRIPT_PREFIX}/tidal/scripts/audio.sh`,
          s3_out: `s3://${bucket}/audio/${videoId}/${version.preset}/audio.ogg`,
        });
      }

      if (version.ext === 'mp4') {
        await dispatchJob('audio', {
          s3_in: s3In,
          cmd: '-vn -c:a aac',
          script_path: `${SCRIPT_PREFIX}/tidal/scripts/audio.sh`,
          s3_out: `s3://${bucket}/audio/${videoId}/${version.preset}/audio.aac`,
        });
      }

      for (const segment of segments) {
        console.log('segment', segment);
        await dispatchJob('transcoding', {
          cmd: version.cmd,
          script_path: `${SCRIPT_PREFIX}/tidal/scripts/transcoding.sh`,
          s3_in: `s3://${bucket}/segments/${videoId}/source/${segment}`,
          s3_out: `s3://${bucket}/segments/${videoId}/${version.preset}/${segment}`,
        });
      }
    }
  } catch (error) {
    console.error('error segmenting', error);
    throw error;
    // Set video status to error-segmenting
  }
}

const inPath = process.argv[2];
const outPath = process.argv[3];
const cmd = process.argv[4];

if (!inPath || !outPath || !cmd) {
  throw new Error('invalid input arguments');
}

main(inPath, outPath, cmd);
