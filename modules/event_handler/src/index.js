const AWS = require('aws-sdk');
const enqueue = require('./enqueue');

module.exports.handler = async ({ Records }) => {
  for (const event of Records) {
    // console.log('event', JSON.stringify(event));

    const item = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);
    console.log(event.eventName, item.id, item.preset, item.status);

    if (item.status === 'segmented') {
      if (Object.values(item.segments).includes(true)) {
        // Transcoding is running
        // TODO :: check if all segments are true, if yes, invoke concat
        // in_path: s3://tidal-bken-dev/segments/transcoded/test/libvpx-vp9_480p
        // out_path: s3://tidal-bken-dev/transcoded/test/libvpx-vp9_480p.webm
      } else {
        // Transcoding is running for the first time
        console.log('enqueuing segments!');
        console.log('unmarshalled', item);
        await enqueue(item);
      }
    }

    if (item.status === 'transcoded') {
    }
  }
};
