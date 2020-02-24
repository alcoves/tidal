const { spawn } = require('child_process');

module.exports = ({ bucket, videoId, concatenatedVideoPath }) => {
  return new Promise((resolve, reject) => {
    const parts = concatenatedVideoPath.split('/');
    const videoName = parts[parts.length - 1];

    console.log('uploading video segments', videoName);

    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'cp',
      concatenatedVideoPath,
      `s3://${bucket}/${videoId}/${videoName}`,
    ]);
    child.on('exit', (code) => {
      clearInterval(interval);
      if (code > 0) reject(code);
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
