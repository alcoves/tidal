const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

module.exports = ({ tmpDir, sourcePath }) => {
  return new Promise((resolve, reject) => {
    console.log('segmenting video');
    const localSegmentPath = path.resolve(`${tmpDir}/segments`);
    fs.mkdirSync(localSegmentPath);
    ffmpeg(sourcePath)
      .outputOptions([
        '-an',
        '-map 0',
        '-c copy',
        '-f segment',
        '-segment_time 00:00:01',
      ])
      .on('progress', () => {})
      .on('error', (error) => reject(error))
      .on('end', () => resolve(localSegmentPath))
      .output(`${localSegmentPath}/output_%04d.mkv`)
      .run();
  });
};
