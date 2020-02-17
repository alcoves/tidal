const path = require('path');
const { exec: execSync } = require('child_process');
const { promisify } = require('util');
const tmpDir = require('./lib/mkTmpDir')();
const fs = require('fs-extra');
const exec = promisify(execSync);

const {
  bucket,
  concatSourcePath,
  concatDestinationPath,
} = require('yargs').argv;

const createManifest = () => {
  const manifestPath = path.resolve(`${tmpDir}/manifest.txt`);
  const transcodedPaths = fs.readdirSync(tmpDir);
  const manifest = fs.createWriteStream(manifestPath, {
    flags: 'a',
  });

  for (const partName of transcodedPaths) {
    console.log(`writing ${partName} to manifest`);
    manifest.write(`file './${partName}'\n`);
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
  await exec(`aws s3 sync s3://${bucket}/${concatSourcePath} ${tmpDir}/`);

  console.log('creating manifest file');
  const manifestPath = createManifest();

  console.log('concatinating video parts');
  await exec(
    `ffmpeg -f concat -safe 0 -i ${manifestPath} -c copy -f mp4 -movflags frag_keyframe+empty_moov pipe:1 | aws s3 cp - s3://${bucket}/${concatDestinationPath}`
  );

  console.log('removing tmpDir');
  await fs.remove(tmpDir);
})();
