const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

module.exports = (videoPath, tmpDir) => {
  return new Promise((resolve, reject) => {
    console.log('segmenting video');
    const localSegmentPath = path.resolve(`${tmpDir}/segments`);
    fs.mkdirpSync(localSegmentPath);
    ffmpeg(videoPath)
      .inputOption('-y')
      .outputOptions(['-an', '-c copy', '-f segment', '-segment_time 00:00:01'])
      .on('progress', () => {})
      .on('error', reject)
      .on('end', () => resolve(fs.readdirSync(localSegmentPath)))
      .output(`${localSegmentPath}/output_%04d.mkv`)
      .run();
  });
};
