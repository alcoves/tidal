const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = ({ tmpDir, sourcePath }) => {
  return new Promise((resolve, reject) => {
    console.log('splitting source audio');
    const sourceAudioPath = path.resolve(`${tmpDir}/source.wav`);
    ffmpeg(path.resolve(sourcePath))
      .on('progress', () => {})
      .on('error', reject)
      .on('end', () => resolve(sourceAudioPath))
      .output(sourceAudioPath)
      .run();
  });
};
