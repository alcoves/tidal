const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const tmpDir = require('./lib/mkTmpDir')();
const download = require('./lib/download');
const TidalEvent = require('./lib/events');

const { spawn } = require('child_process');
const { bucket, videoId, segmentSourcePath } = require('yargs').argv;

if (!bucket) throw new Error('bucket must be defined');
if (!videoId) throw new Error('videoId must be defined');
if (!segmentSourcePath) throw new Error('segmentSourcePath must be defined');

const events = new TidalEvent({
  videoId,
  region: 'us-east-1',
  snsTopicArn: 'arn:aws:sns:us-east-1:594206825329:bken-prod-tidal-events',
});

const getTranscodePresets = async (localSourcePath) => {
  const presets = {
    highQuality: [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-crf 22',
      '-coder 1',
      '-c:a aac',
      '-ac 2',
      '-b:a 320K',
      '-ar 48000',
      '-profile:a aac_low',
    ],
    '2160p': [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=3840:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ],
    '1440p': [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=2560:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ],
    '1080p': [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=1920:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ],
    '720p': [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=1280:-2',
      '-crf 27',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 128K',
      '-ar 48000',
      '-profile:a aac_low',
    ],
  };

  // query the video with ffprobe
  // decide what presets to return based on video metadata
  return [
    { presetName: '2160p', ffmpegCmdStr: presets['2160p'].join(' ') },
    { presetName: '1440p', ffmpegCmdStr: presets['1440p'].join(' ') },
    { presetName: '1080p', ffmpegCmdStr: presets['1080p'].join(' ') },
    { presetName: '720p', ffmpegCmdStr: presets['720p'].join(' ') },
  ]; // placeholder
};

const segmentVideo = (sourcePath) => {
  return new Promise((resolve, reject) => {
    const localSegmentPath = `${tmpDir}/segments`;
    fs.mkdirSync(localSegmentPath);
    ffmpeg(path.resolve(sourcePath))
      .outputOptions(['-map 0', '-c copy', '-f segment', '-segment_time 10'])
      .on('progress', () => {})
      .on('error', () => {
        console.error(error);
        reject();
      })
      .on('end', () => resolve(localSegmentPath))
      .output(`${localSegmentPath}/output_%04d.mkv`)
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
  const transcodePresets = await getTranscodePresets(localSourcePath);

  console.log('segmenting video');
  const localSegmentPath = await segmentVideo(localSourcePath);

  console.log('uploading segments');
  await uploadSegments(bucket, localSegmentPath, segmentDestinationPath);

  console.log('removing tmpDir', tmpDir);
  await fs.remove(tmpDir);

  console.log('returning');
  if (process.send) process.send(transcodePresets);
})();
