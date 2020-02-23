const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const download = require('./lib/download');
const TidalEvent = require('./lib/events');
const getPresets = require('./lib/getPresets');

const { spawn } = require('child_process');
const { bucket, videoId, segmentSourcePath, tmpDir } = require('yargs').argv;

if (!tmpDir) throw new Error('tmpDir must be defined');
if (!bucket) throw new Error('bucket must be defined');
if (!videoId) throw new Error('videoId must be defined');
if (!segmentSourcePath) throw new Error('segmentSourcePath must be defined');

const events = new TidalEvent({
  videoId,
  region: 'us-east-1',
  snsTopicArn: 'arn:aws:sns:us-east-1:594206825329:bken-prod-tidal-events',
});

const segmentVideo = (sourcePath) => {
  return new Promise((resolve, reject) => {
    const localSegmentPath = `${tmpDir}/segments`;
    fs.mkdirSync(localSegmentPath);
    ffmpeg(path.resolve(sourcePath))
      .outputOptions([
        '-an',
        '-map 0',
        '-c copy',
        '-f segment',
        '-segment_time 00:00:01',
      ])
      .on('progress', () => {})
      .on('error', (error) => {
        console.error(error);
        reject();
      })
      .on('end', () => resolve(localSegmentPath))
      .output(`${localSegmentPath}/output_%04d.mkv`)
      .run();
  });
};

const splitAudioFromSource = (localSourcePath) => {
  return new Promise((resolve, reject) => {
    const sourceAudioPath = `${tmpDir}/source.wav`;
    ffmpeg(path.resolve(localSourcePath))
      .on('progress', () => {})
      .on('error', (error) => {
        console.error(error);
        reject();
      })
      .on('end', () => resolve(sourceAudioPath))
      .output(sourceAudioPath)
      .run();
  });
};

const uploadSegments = (bucket, localSegmentPath, segmentDestinationPath) => {
  return new Promise((resolve, reject) => {
    let lastMessage;
    const interval = setInterval(() => {
      if (lastMessage) console.log(lastMessage);
      lastMessage = null;
    }, 500);

    const child = spawn('aws', [
      's3',
      'sync',
      `${localSegmentPath}`,
      `s3://${bucket}/${segmentDestinationPath}`,
    ]);
    child.on('exit', (code) => {
      console.log(`uploadSegments exited with code ${code}`);
      clearInterval(interval);
      resolve();
    });
    child.stdout.on('data', (data) => {
      lastMessage = data.toString();
    });
    child.stderr.on('data', (data) => {
      lastMessage = data.toString();
    });
  });
};

(async () => {
  const segmentDestinationPath = `${videoId}/segments`;

  const localSourcePath = await download(
    { Bucket: bucket, Key: segmentSourcePath },
    tmpDir
  );

  console.log('calculating transcode presets');
  const transcodePresets = await getPresets(localSourcePath);

  console.log('segmenting video');
  const localSegmentPath = await segmentVideo(localSourcePath);

  console.log('saving source audio');
  await splitAudioFromSource(localSourcePath, localSegmentPath);

  console.log('uploading segments');
  await uploadSegments(bucket, localSegmentPath, segmentDestinationPath);

  console.log('returning');
  if (process.send) process.send(transcodePresets);
})();
