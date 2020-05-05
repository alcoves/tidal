const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

const s3ls = async (params, items = []) => {
  const { Contents, NextContinuationToken } = await s3
    .listObjectsV2(params)
    .promise();
  Contents.map((item) => items.push(item));
  if (NextContinuationToken) {
    params.ContinuationToken = NextContinuationToken;
    return s3ls(params, items);
  }
  return items.sort();
};

module.exports = s3ls;
