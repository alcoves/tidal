const { fork } = require('child_process');

const { s3Dir, sourceFileName } = require('yargs').argv;

if (!s3Dir) throw new Error('s3Dir must be defined');
if (!sourceFileName) throw new Error('sourceFileName must be defined');

const run = (scriptPath, forkArgs = []) => {
  return new Promise((resolve, reject) => {
    const process = fork(scriptPath, forkArgs);
    process.on('error', reject);
    process.on('exit', resolve);
    process.on('message', resolve);
  });
};

(async () => {
  const transcodePresets = await run('./src/segment.js', [
    '--bucket=bken-dve-dev',
    `--segmentSourcePath=${s3Dir}/${sourceFileName}`,
    `--segmentDestinationPath=${s3Dir}/segments`,
  ]);

  await Promise.all(
    transcodePresets.map(({ ffmpegCmdStr, presetName }) => {
      console.log(`transcoding to ${presetName}`);
      return run('./src/transcode.js', [
        '--bucket=bken-dve-dev',
        `--segmentSourcePath=${s3Dir}/segments`,
        `--transcodeDestinationPath=${s3Dir}/transcoded/${presetName}`,
        `--ffmpegCmdStr=${ffmpegCmdStr}`,
      ]);
    })
  );

  await Promise.all(
    transcodePresets.map(({ presetName }) => {
      console.log(`concatinating ${presetName}`);
      return run('./src/concat.js', [
        '--bucket=bken-dve-dev',
        `--concatSourcePath=${s3Dir}/transcoded/${presetName}`,
        `--concatDestinationPath=${s3Dir}/${presetName}.mp4`,
      ]);
    })
  );
})();
