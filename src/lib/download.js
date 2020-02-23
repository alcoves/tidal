const { spawn } = require('child_process');

module.exports = async ({ Bucket, Key }, tmpDir) => {
  return new Promise((resolve, reject) => {
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const sourceName = 'source.mp4';
    const sourceFullPath = `${tmpDir}/${sourceName}`;
    console.log('downloading source file', sourceFullPath);
    const child = spawn('aws', [
      's3',
      'cp',
      `s3://${Bucket}/${Key}`,
      `${sourceFullPath}`,
    ]);
    child.on('exit', (code) => {
      clearInterval(interval);
      if (code > 0) reject(`download exited with code: ${code}`);
      resolve(sourceFullPath);
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
  });
};
