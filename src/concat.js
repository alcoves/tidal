const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const TidalEvent = require('./lib/events');
const tmpDir = require('./lib/mkTmpDir')();
const { spawn } = require('child_process');

const { bucket, preset, videoId } = require('yargs').argv;

if (!bucket) throw new Error('bucket must be defined');
if (!preset) throw new Error('preset must be defined');
if (!videoId) throw new Error('videoId must be defined');

const events = new TidalEvent({
  videoId,
  region: 'us-east-1',
  snsTopicArn: 'arn:aws:sns:us-east-1:594206825329:bken-prod-tidal-events',
});

const downloadTranscodedParts = (bucket, concatSourcePath, tmpDir) => {
  return new Promise((resolve, reject) => {
    function printMsg(msg) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(msg);
    }

    const child = spawn('aws', [
      's3',
      'sync',
      `s3://${bucket}/${concatSourcePath}`,
      `${tmpDir}/parts/`,
    ]);
    child.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
      resolve();
    });
    child.stdout.on('data', printMsg);
    child.stderr.on('data', printMsg);
  });
};

const concatinateVideoParts = (manifestPath, localConcatPath) => {
  return new Promise((resolve, reject) => {
    // ffmpeg(path.resolve(sourcePath))
    //   .outputOptions(['-map 0', '-c copy', '-f segment', '-segment_time 10'])
    //   .on('progress', () => {})
    //   .on('error', reject)
    //   .on('end', () => resolve(localSegmentPath))
    //   .output(`${localSegmentPath}/output_%04d.mkv`)
    //   .run();

    const child = spawn('ffmpeg', [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      manifestPath,
      '-c',
      'copy',
      '-reset_timestamps',
      '1',
      '-movflags',
      '+faststart',
      localConcatPath,
    ]);
    child.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
      resolve();
    });
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
  });
};

const copyConcatinatedVideo = (localConcatPath, bucket, concatDestPath) => {
  console.log({ localConcatPath, bucket, concatDestPath });
  return new Promise((resolve, reject) => {
    function printMsg(msg) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(msg);
    }

    const child = spawn('aws', [
      's3',
      'cp',
      localConcatPath,
      `s3://${bucket}/${concatDestPath}`,
    ]);
    child.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
      resolve();
    });
    child.stdout.on('data', printMsg);
    child.stderr.on('data', printMsg);
  });
};

const createManifest = () => {
  const manifestPath = path.resolve(`${tmpDir}/manifest.txt`);
  const transcodedPaths = fs.readdirSync(`${tmpDir}/parts/`);
  const manifest = fs.createWriteStream(manifestPath, {
    flags: 'a',
  });

  for (const partName of transcodedPaths) {
    manifest.write(`file './parts/${partName}'\n`);
  }

  manifest.end();
  return manifestPath;
};

(async () => {
  const concatSourcePath = `${videoId}/transcoded/${preset}`;
  const concatDestPath = `${videoId}/${preset}.mp4`;
  const localConcatPath = `${tmpDir}/concat.mp4`;

  console.log(`downloading transcoded parts from ${concatSourcePath}`);
  await downloadTranscodedParts(bucket, concatSourcePath, tmpDir);

  console.log('creating manifest file');
  const manifestPath = createManifest();

  console.log('concatinating video parts');
  await concatinateVideoParts(manifestPath, localConcatPath);

  console.log('uploading output to s3');
  await copyConcatinatedVideo(localConcatPath, bucket, concatDestPath);
  await events.emit('end', { videoId, preset, status: 'done' });

  console.log('removing tmpDir');
  await fs.remove(tmpDir);
})();
