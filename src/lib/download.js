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
    console.log('downloading source file');
    const child = spawn('aws', [
      's3',
      'cp',
      `s3://${Bucket}/${Key}`,
      `${sourceFullPath}`,
    ]);
    child.on('exit', (code) => {
      console.log(`downloading exited with code ${code}`);
      clearInterval(interval);
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
