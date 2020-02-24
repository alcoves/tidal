const getObjectKeys = require('./getObjectKeys');

const sleep = (t) => new Promise((r) => setTimeout(() => r(), t));

module.exports = async ({
  bucket,
  presetName,
  remoteSegmentPath,
  transcodeDestinationPath,
}) => {
  const segmentedItems = await getObjectKeys({
    Bucket: bucket,
    Prefix: remoteSegmentPath,
  });

  let transcodedItems;

  do {
    transcodedItems = await getObjectKeys({
      Bucket: bucket,
      Prefix: transcodeDestinationPath,
    });
    console.log(
      `${presetName}: ${transcodedItems.length}/${segmentedItems.length}`
    );
    await sleep(3000);
  } while (transcodedItems.length < segmentedItems.length);
};
