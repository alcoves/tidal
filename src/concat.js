const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const TidalEvent = require('./lib/events');
const tmpDir = require('./lib/mkTmpDir')();

const { promisify } = require('util');
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
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'sync',
      `s3://${bucket}/${concatSourcePath}`,
      `${tmpDir}/parts/`,
    ]);
    child.on('exit', (code) => {
      console.log(`downloadTranscodedParts exited with code ${code}`);
      clearInterval(interval);
      resolve();
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
  });
};

const concatinateVideoParts = (manifestPath, localConcatPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(path.resolve(manifestPath))
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy', '-reset_timestamps 1', '-movflags +faststart'])
      .on('progress', () => {})
      .on('error', (error) => {
        console.error(error);
        reject();
      })
      .on('end', resolve)
      .output(localConcatPath)
      .run();
  });
};

const copyConcatinatedVideo = (localConcatPath, bucket, concatDestPath) => {
  return new Promise((resolve, reject) => {
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'cp',
      localConcatPath,
      `s3://${bucket}/${concatDestPath}`,
    ]);
    child.on('exit', (code) => {
      console.log(`copyConcatinatedVideo exited with code ${code}`);
      clearInterval(interval);
      resolve();
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
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

  console.log('creating manifest file', preset);
  const manifestPath = createManifest();

  console.log('concatinating video parts', preset);
  await concatinateVideoParts(manifestPath, localConcatPath);

  console.log('uploading output to s3', preset);
  await copyConcatinatedVideo(localConcatPath, bucket, concatDestPath);
  await events.emit('end', { videoId, preset, status: 'done' });

  console.log('removing tmpDir', preset, tmpDir);
  await fs.remove(tmpDir);
})();
