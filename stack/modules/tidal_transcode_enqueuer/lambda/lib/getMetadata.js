const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3()

module.exports = async (params) => {
  const { Body } = await s3.getObject(params).promise();
  return JSON.parse(Body);
}