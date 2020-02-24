const path = require('path');
const { spawn } = require('child_process');

module.exports = ({ bucket, tmpDir, presetName, transcodeDestinationPath }) => {
  return new Promise((resolve, reject) => {
    const transcodedLocalPath = path.resolve(`${tmpDir}/${presetName}`);
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'sync',
      `s3://${bucket}/${transcodeDestinationPath}`,
      `${transcodedLocalPath}/`,
    ]);
    child.on('exit', (code) => {
      clearInterval(interval);
      if (code > 0) reject(code);
      resolve(transcodedLocalPath);
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
  });
};
