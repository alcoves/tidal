const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const tmpDir = require('./lib/mkTmpDir')();
const download = require('./lib/download');

const { exec } = require('child_process');
const {
  bucket,
  segmentSourcePath,
  segmentDestinationPath,
} = require('yargs').argv;

if (!bucket) throw new Error('bucket must be defined');
if (!segmentSourcePath) throw new Error('segmentSourcePath must be defined');
if (!segmentDestinationPath)
  throw new Error('segmentDestinationPath must be defined');

const getTranscodePresets = async localSourcePath => {
  // query the video with ffprobe
  // decide what presets to return based on video metadata
  return [{ presetName: '1080p', ffmpegCmdStr: '-c:v libx264 -crf 27' }]; // placeholder
};

const segmentVideo = sourcePath => {
  return new Promise((resolve, reject) => {
    const localSegmentPath = `${tmpDir}/segments`;
    fs.mkdirSync(localSegmentPath);
    ffmpeg(path.resolve(sourcePath))
      .outputOptions([
        '-map 0',
        '-c copy',
        '-f segment',
        '-segment_time 10',
        '-reset_timestamps 1',
      ])
      .on('progress', () => {})
      .on('error', reject)
      .on('end', () => resolve(localSegmentPath))
      .output(`${localSegmentPath}/output_%04d.mp4`)
      .run();
  });
};

const uploadSegments = (bucket, localSegmentPath, segmentDestinationPath) => {
  return new Promise((resolve, reject) => {
    exec(
      `aws s3 sync ${localSegmentPath} s3://${bucket}/${segmentDestinationPath}`,
      (error, stdout, stderr) => {
        if (error || stderr) reject(error || stderr);
        resolve();
      }
    );
  });
};

(async () => {
  console.log('downloading source video');
  const localSourcePath = await download(
    { Bucket: bucket, Key: segmentSourcePath },
    tmpDir
  );

  console.log('calculating transcode presets');
  const transcodePresets = await getTranscodePresets(localSourcePath);

  console.log('segmenting video');
  const localSegmentPath = await segmentVideo(localSourcePath);

  console.log('uploading segments');
  await uploadSegments(bucket, localSegmentPath, segmentDestinationPath);

  console.log('removing tmpDir');
  await fs.remove(tmpDir);

  console.log('returning');
  process.send(transcodePresets);
})();
