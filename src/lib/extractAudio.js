const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = (sourcePath) => {
  return new Promise((resolve, reject) => {
    console.log('splitting source audio');
    const sourceAudioPath = path.resolve('local/source.wav');
    ffmpeg(path.resolve(sourcePath))
      .inputOption('-y')
      .on('progress', () => { })
      .on('error', reject)
      .on('end', () => resolve({ audioPath: sourceAudioPath, ext: 'wav' }))
      .output(sourceAudioPath)
      .run();
  });
};