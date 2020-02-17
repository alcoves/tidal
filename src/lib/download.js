const fs = require('fs-extra');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

module.exports = async ({ Bucket, Key }, tmpDir) => {
  return new Promise((resolve, reject) => {
    const sourceName = 'source.mp4';
    const sourceFullPath = `${tmpDir}/${sourceName}`;
    s3.getObject({ Bucket, Key })
      .createReadStream()
      .on('error', e => reject(e))
      .pipe(fs.createWriteStream(sourceFullPath))
      .on('error', e => reject(e))
      .on('close', () => resolve(sourceFullPath));
  });
};
