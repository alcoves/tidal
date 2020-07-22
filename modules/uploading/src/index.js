const putVideo = require('./lib/putVideo');
const getPresets = require('./lib/getPresets');
const dispatchJob = require('./lib/dispatchJob');
const getMetadata = require('./lib/getMetadata');

const { WASABI_BUCKET } = process.env;

module.exports.handler = async (event) => {
  for (const { s3 } of event.Records) {
    const bucket = s3.bucket.name;
    const videoId = s3.object.key.split('/')[1];
    const filename = s3.object.key.split('/')[2];
    const sourceS3Path = `s3://${bucket}/uploads/${videoId}/${filename}`;
    console.log({ bucket, videoId, filename, sourceS3Path });

    const { width, duration, framerate } = await getMetadata(sourceS3Path);
    const presets = getPresets(width, framerate);
    console.log({ width, duration, presets });

    await putVideo({ id: videoId, presets, duration });

    await dispatchJob('audio', {
      s3_in: sourceS3Path,
      cmd: '-vn -c:a aac -threads 2',
      s3_out: `s3://${bucket}/audio/${videoId}/source.aac`,
    });

    await dispatchJob('audio', {
      s3_in: sourceS3Path,
      cmd: '-vn -c:a libopus -f opus -threads 2',
      s3_out: `s3://${bucket}/audio/${videoId}/source.ogg`,
    });

    await dispatchJob('thumbnail', {
      cmd: '-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50 -threads 1',
      s3_in: sourceS3Path,
      s3_out: `s3://${WASABI_BUCKET}/i/${videoId}/default.webp`,
    });

    await dispatchJob('segmenting', {
      s3_in: sourceS3Path,
      cmd: '-an -c:v copy -f segment -segment_time 10 -threads 2',
      s3_out: `s3://${bucket}/segments/${videoId}/source`,
    });
  }
};
