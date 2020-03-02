const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
  console.log('event', event);

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
}