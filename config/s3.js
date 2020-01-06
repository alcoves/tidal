const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
  secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  maxRetries: 2,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
});

const endpoint = new AWS.Endpoint('s3.us-east-2.wasabisys.com');
const s3 = new AWS.S3({ endpoint });

module.exports = s3;
