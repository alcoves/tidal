const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = ({ tmpDir, sourceFile }) => {
  return new Promise((resolve, reject) => {
    console.time('splitting source audio');
    const sourceAudioPath = path.resolve(`${tmpDir}/source.wav`);
    ffmpeg(sourceFile)
      .on('progress', () => {})
      .on('error', reject)
      .on('end', () => {
        console.timeEnd('splitting source audio');
        resolve(sourceAudioPath);
      })
      .output(sourceAudioPath)
      .run();
  });
};
