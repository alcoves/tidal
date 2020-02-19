const { fork } = require('child_process');

const { videoId, sourceFileName } = require('yargs').argv;

if (!videoId) throw new Error('videoId must be defined');
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
    `--videoId=${videoId}`,
    '--bucket=bken-dve-dev',
    `--segmentSourcePath=${videoId}/${sourceFileName}`,
  ]);

  await Promise.all(
    transcodePresets.map(({ ffmpegCmdStr, presetName }) => {
      console.log(`transcoding to ${presetName}`);
      return run('./src/transcode.js', [
        `--videoId=${videoId}`,
        '--bucket=bken-dve-dev',
        `--preset=${presetName}`,
        `--ffmpegCmdStr=${ffmpegCmdStr}`,
      ]);
    })
  );

  await Promise.all(
    transcodePresets.map(({ presetName }) => {
      console.log(`concatinating ${presetName}`);
      return run('./src/concat.js', [
        `--videoId=${videoId}`,
        '--bucket=bken-dve-dev',
        `--preset=${presetName}`,
      ]);
    })
  );

  console.log('pipeline complete!');
})();
