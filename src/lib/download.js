const { spawn } = require('child_process');

module.exports = async ({ Bucket, Key }, tmpDir) => {
  return new Promise((resolve, reject) => {
    function printMsg(msg) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(msg);
    }

    const sourceName = 'source.mp4';
    const sourceFullPath = `${tmpDir}/${sourceName}`;
    console.log('downloading source file');
    const child = spawn('aws', [
      's3',
      'cp',
      `s3://${Bucket}/${Key}`,
      `${sourceFullPath}`,
    ]);
    child.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
      resolve(sourceFullPath);
    });
    child.stdout.on('data', printMsg);
    child.stderr.on('data', printMsg);
  });
};
