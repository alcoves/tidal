const fs = require('fs-extra');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({ region: 'us-east-1' });

const downloadObject = (params, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = `local/${filename}`
      const file = fs.createWriteStream(filePath);
      s3.getObject(params).createReadStream().on('error', console.error).pipe(file)
      file.on('close', () => {
        console.log('Download complete');
        resolve(filePath)
      });
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = downloadObject