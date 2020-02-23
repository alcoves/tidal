const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const TidalEvent = require('./lib/events');

const { spawn } = require('child_process');
const { bucket, preset, videoId, tmpDir } = require('yargs').argv;

if (!tmpDir) throw new Error('tmpDir must be defined');
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
      `${tmpDir}/${preset}/`,
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

const concatinateVideoParts = (
  manifestPath,
  concatVideoName,
  finalVideoName
) => {
  return new Promise((resolve, reject) => {
    ffmpeg(path.resolve(manifestPath))
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .on('progress', (progress) => {
        console.log(progress);
      })
      .on('error', (error) => {
        console.error(error);
        reject(error);
      })
      .on('end', () => {
        ffmpeg(concatVideoName)
          .input(path.resolve(`${tmpDir}/source.wav`))
          .outputOptions(['-c:v copy', '-c:a aac', '-movflags faststart'])
          .on('progress', (progress) => {
            console.log(progress);
          })
          .on('error', (error) => {
            console.error(error);
            reject(error);
          })
          .on('end', resolve)
          .output(finalVideoName)
          .run();
      })
      .output(concatVideoName)
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

const createManifest = (preset) => {
  const manifestPath = path.resolve(`${tmpDir}/${preset}-manifest.txt`);
  const transcodedPaths = fs.readdirSync(`${tmpDir}/${preset}/`);
  const manifest = fs.createWriteStream(manifestPath, {
    flags: 'a',
  });

  for (const partName of transcodedPaths) {
    manifest.write(`file './${preset}/${partName}'\n`);
  }

  manifest.end();
  return manifestPath;
};

(async () => {
  const concatSourcePath = `${videoId}/transcoded/${preset}`;
  const concatDestPath = `${videoId}/${preset}.mp4`;

  const concatVideoName = `${tmpDir}/concat-${preset}.mp4`;
  const finalVideoName = `${tmpDir}/${preset}.mp4`;

  console.log(`downloading transcoded parts from ${concatSourcePath}`);
  await downloadTranscodedParts(bucket, concatSourcePath, tmpDir, preset);

  console.log('creating manifest file', preset);
  const manifestPath = createManifest(preset);

  console.log('concatinating video parts', preset);
  await concatinateVideoParts(manifestPath, concatVideoName, finalVideoName);

  console.log('uploading output to s3', preset);
  await copyConcatinatedVideo(concatVideoName, bucket, concatDestPath);
  await events.emit('end', { videoId, preset, status: 'done' });
})();
