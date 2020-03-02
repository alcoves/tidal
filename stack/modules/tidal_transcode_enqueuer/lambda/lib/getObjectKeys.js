const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

const getObjects = async (params, items = []) => {
  const { Contents, NextContinuationToken } = await s3
    .listObjectsV2(params)
    .promise();
  Contents.map((item) => items.push(item));
  if (NextContinuationToken) {
    params.ContinuationToken = NextContinuationToken;
    return getObjects(params, items);
  }
  return items;
};

module.exports = getObjects;
