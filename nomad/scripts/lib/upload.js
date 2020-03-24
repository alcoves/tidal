const fs = require('fs-extra');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

module.exports = (Bucket, Key, filePath) => {
  console.log(`Uploading ${filePath} to s3://${Bucket}/${Key}`);
  return s3.upload({
    Key,
    Bucket,
    Body: fs.createReadStream(filePath)
  }).promise();
}