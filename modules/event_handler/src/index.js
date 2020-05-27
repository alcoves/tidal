const AWS = require('aws-sdk');
const enqueue = require('./enqueue');

const sqs = new AWS.SQS({ region: 'us-east-1' });

module.exports.handler = async ({ Records }) => {
  for (const event of Records) {
    console.log('event', JSON.stringify(event));
    const item = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);
    console.log(event.eventName, item.id, item.preset, item.status);

    if (item.status === 'segmented') {
      const { transcoded, transcoding } = Object.values(item.segments).reduce(
        (acc, cv) => {
          cv ? acc.transcoded++ : acc.transcoding++;
          return acc;
        },
        { transcoded: 0, transcoding: 0 }
      );

      console.log('transcoded', transcoded);
      console.log('transcoding', transcoding);

      if (!transcoded) {
        // Transcoding is running for the first time
        console.log('no segments transcoded, no segments transcoding');
        console.log('unmarshalled', item);
        await enqueue(item);
      } else if (transcoded && !transcoding) {
        console.log(
          'audio check',
          item.audio && Object.keys(item.audio).length >= 2
        );
        // ogg and aac audio should have reported in by now

        if (item.audio && Object.keys(item.audio) >= 2) {
          // All segments are done, concatinate the video
          console.log('all segments are transcoded, invoking concatinator');

          await sqs
            .sendMessage({
              MessageBody: JSON.stringify({
                in_path: `s3://${process.env.TIDAL_BUCKET}/segments/transcoded/${item.id}/${item.preset}/`,
                out_path: `s3://${process.env.TIDAL_BUCKET}/transcoded/${item.id}/${item.preset}.${item.ext}`,
              }),
              QueueUrl: process.env.TIDAL_CONCAT_QUEUE_URL,
            })
            .promise();
        }
      }
    }
  }
};
