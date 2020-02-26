// const path = require('path');
// const logger = require('./logger');
// const { spawn } = require('child_process');

// module.exports = ({ bucket, videoId, sourceFileName, tmpDir }) => {
//   return new Promise((resolve, reject) => {
//     let lastMessage;
//     const interval = setInterval(() => {
//       if (lastMessage) console.log(lastMessage);
//       lastMessage = null;
//     }, 500);

//     const sourceFullPath = path.resolve(`${tmpDir}/${sourceFileName}`);
//     logger.log(`downloading source file: ${sourceFullPath}`);
//     const child = spawn('aws', [
//       's3',
//       'cp',
//       `s3://${bucket}/${videoId}/${sourceFileName}`,
//       `${sourceFullPath}`,
//     ]);
//     child.on('exit', (code) => {
//       clearInterval(interval);
//       if (code > 0) reject(`download exited with code: ${code}`);
//       resolve(sourceFullPath);
//     });
//     child.stdout.on('data', (data) => {
//       lastMessage = data.toString();
//     });
//     child.stderr.on('data', (data) => {
//       lastMessage = data.toString();
//     });
//   });
// };
