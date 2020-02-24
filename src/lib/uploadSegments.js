const { spawn } = require('child_process');

module.exports = ({ bucket, segmentPath, remoteSegmentPath }) => {
  return new Promise((resolve, reject) => {
    console.log('uploading segments');
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'sync',
      `${segmentPath}`,
      `s3://${bucket}/${remoteSegmentPath}`,
    ]);
    child.on('exit', (code) => {
      clearInterval(interval);
      if (code > 0) reject(`uploading segments exited code ${code}`);
      resolve(code);
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
  });
};
