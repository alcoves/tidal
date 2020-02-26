const { spawn } = require('child_process');

module.exports = ({ bucket, videoId, concatenatedVideoPath }) => {
  return new Promise((resolve, reject) => {
    console.time('uploading video segments');

    const parts = concatenatedVideoPath.split('/');
    const videoName = parts[parts.length - 1];

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
      console.timeEnd('uploading video segments');
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
