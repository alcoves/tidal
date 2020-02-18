const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const TidalEvent = require('./lib/events');
const tmpDir = require('./lib/mkTmpDir')();
const { exec: execSync } = require('child_process');

const exec = promisify(execSync);

const {
  bucket,
  preset,
  videoId,
  concatSourcePath,
  concatDestinationPath,
} = require('yargs').argv;

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

if (!bucket) throw new Error('bucket must be defined');
if (!preset) throw new Error('preset must be defined');
if (!videoId) throw new Error('videoId must be defined');

const events = new TidalEvent({
  videoId,
  region: 'us-east-1',
  snsTopicArn: 'arn:aws:sns:us-east-1:594206825329:bken-prod-tidal-events',
});

(async () => {
  const concatSourcePath = `${videoId}/transcoded/${preset}`;
  const localConcatPath = `${tmpDir}/concat.mp4`;

  console.log(`downloading transcoded parts from ${concatSourcePath}`);
  await exec(`aws s3 sync s3://${bucket}/${concatSourcePath} ${tmpDir}/parts/`);

  console.log('creating manifest file');
  const manifestPath = createManifest();

  console.log('concatinating video parts');
  await exec(
    `ffmpeg -f concat -safe 0 -i ${manifestPath} -c copy -reset_timestamps 1 -movflags +faststart ${localConcatPath}`,
    { maxBuffer: 1024 * 1024 * 50 }
  );

  await exec(`aws s3 cp ${localConcatPath} s3://${bucket}/${concatSourcePath}`);
  await events.emit('end', { videoId, preset, status: 'done' });

  console.log('removing tmpDir');
  await fs.remove(tmpDir);
})();
