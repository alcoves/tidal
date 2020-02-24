const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

const sleep = (t) => new Promise((r) => setTimeout(() => r(), t));

module.exports = async ({
  bucket,
  presetName,
  remoteSegmentPath,
  transcodeDestinationPath,
}) => {
  const { Contents: segmentedItems } = await s3
    .listObjectsV2({ Bucket: bucket, Prefix: remoteSegmentPath })
    .promise();

  let s3Res = { Contents: [] };
  // poll s3 until the number of converted objects equals the number of segmented objects
  do {
    s3Res = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: transcodeDestinationPath })
      .promise();
    console.log(
      `${presetName}: ${s3Res.Contents.length}/${segmentedItems.length}`
    );
    await sleep(3000);
  } while (s3Res.Contents.length < segmentedItems.length);
};
