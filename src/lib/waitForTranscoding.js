const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

const sleep = (t) => new Promise((r) => setTimeout(() => r(), t));

const getObjectCount = async (params, items = []) => {
  const { Contents, NextContinuationToken } = await s3
    .listObjectsV2(params)
    .promise();
  Contents.map((item) => items.push(item));
  if (NextContinuationToken) {
    params.ContinuationToken = NextContinuationToken;
    return getObjectCount(params, items);
  }
  return items;
};

module.exports = async ({
  bucket,
  presetName,
  remoteSegmentPath,
  transcodeDestinationPath,
}) => {
  const segmentedItems = await getObjectCount({
    Bucket: bucket,
    Prefix: remoteSegmentPath,
  });

  let transcodedItems;

  do {
    transcodedItems = await getObjectCount({
      Bucket: bucket,
      Prefix: transcodeDestinationPath,
    });
    console.log(
      `${presetName}: ${transcodedItems.length}/${segmentedItems.length}`
    );
    await sleep(3000);
  } while (transcodedItems.length < segmentedItems.length);
};
