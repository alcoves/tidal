const {
  updateAudio,
  updateSegmentStatus,
} = require('./lib/dbHelper');

const enqueueJob = require('./lib/enqueueJob');

module.exports.handler = async function (event) {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const folder = record.s3.object.key.split('/')[0];

    if (folder === 'audio') {
      const [, id] = record.s3.object.key.split('/');
      await updateAudio({ id, object: record.s3.object });
    }

    if (folder === 'segments') {
      const [, id, preset, segment] = record.s3.object.key.split('/');
      if (preset === 'source') {
        await enqueueJob({ id, bucket, segment });
      } else {
        await updateSegmentStatus({ id, segment, status: true });
      }
    }
  }
};
