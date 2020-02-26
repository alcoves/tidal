const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

module.exports = ({ tmpDir, sourceFile }) => {
  return new Promise((resolve, reject) => {
    console.time('segmenting video');
    const localSegmentPath = path.resolve(`${tmpDir}/segments`);
    fs.mkdirSync(localSegmentPath);
    ffmpeg(sourceFile)
      .outputOptions([
        '-an',
        '-map 0',
        '-c copy',
        '-f segment',
        '-segment_time 00:00:01',
      ])
      .on('progress', () => {})
      .on('error', reject)
      .on('end', () => {
        console.timeEnd('segmenting video');
        resolve(localSegmentPath);
      })
      .output(`${localSegmentPath}/output_%04d.mkv`)
      .run();
  });
};
