const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const tmpDir = require('./lib/mkTmpDir')();
const { exec: execSync } = require('child_process');

const exec = promisify(execSync);

const {
  bucket,
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

if (!bucket) throw new Error('manifestPath must be defined');
if (!concatSourcePath) throw new Error('concatSourcePath must be defined');
if (!concatDestinationPath)
  throw new Error('concatDestinationPath must be defined');

(async () => {
  console.log('tmpDir', tmpDir);
  console.log(`downloading transcoded parts from ${concatSourcePath}`);
  const localConcatPath = `${tmpDir}/concat.mp4`;
  await exec(`aws s3 sync s3://${bucket}/${concatSourcePath} ${tmpDir}/parts/`);

  console.log('creating manifest file');
  const manifestPath = createManifest();

  console.log('concatinating video parts');

  await exec(
    `ffmpeg -f concat -safe 0 -i ${manifestPath} -c copy -reset_timestamps 1 -movflags +faststart ${localConcatPath}`,
    { maxBuffer: 1024 * 1024 * 50 }
  );

  await exec(
    `aws s3 cp ${localConcatPath} s3://${bucket}/${concatDestinationPath}`
  );

  console.log('removing tmpDir');
  await fs.remove(tmpDir);
})();
