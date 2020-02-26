const path = require('path');
const logger = require('./logger');
const { spawn } = require('child_process');

module.exports = ({ sourceKey, sourceBucket, tmpDir }) => {
  return new Promise((resolve, reject) => {
    console.time('downloading source file');
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const fileName = sourceKey.split('/').pop();
    const sourceFullPath = path.resolve(`${tmpDir}/${fileName}`);
    logger.log(`downloading source file: ${sourceFullPath}`);
    const child = spawn('aws', [
      's3',
      'cp',
      `s3://${sourceBucket}/${sourceKey}`,
      `${sourceFullPath}`,
      '--profile',
      'bkenw',
      '--endpoint-url',
      'https://s3.us-east-2.wasabisys.com',
    ]);
    child.on('exit', (code) => {
      clearInterval(interval);
      if (code > 0) reject(new Error(`download exited with code: ${code}`));
      console.timeEnd('downloading source file');
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
