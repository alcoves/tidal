const getPresets = require('./lib/getPresets')
const getMetadata = require('./lib/getMetadata')
const getObjectKeys = require('./lib/getObjectKeys')
const enqueueMessages = require('./lib/enqueueMessages')

module.exports.handler = async (event) => {
  console.log('event', event);

  const Key = event.Records[0].s3.object.key;
  const Bucket = event.Records[0].s3.bucket.name;
  const videoId = Key.split('/')[1]

  const metadata = await getMetadata({ Bucket, Key });
  console.log({ metadata });

  const segments = await getObjectKeys({ Bucket, Prefix: `segments/${videoId}` });
  console.log({ segments: segments.length });

  const presets = await getPresets(metadata);
  console.log({ presets });

  return enqueueMessages(segments, presets, Bucket, videoId)
}