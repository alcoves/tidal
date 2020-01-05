const AWS = require('aws-sdk');
const WASABI_ENDPOINT = 'https://s3.us-east-2.wasabisys.com';

AWS.config.update({
  accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
  secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  maxRetries: 6,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 5000,
  },
});

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(WASABI_ENDPOINT),
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

module.exports = s3;
