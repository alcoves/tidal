const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = ({
  presetName,
  manifestPath,
  sourceAudioPath,
  transcodedLocalPath,
}) => {
  const finalVideoPath = path.resolve(
    `${transcodedLocalPath}/${presetName}.mp4`
  );

  return new Promise((resolve, reject) => {
    console.time('concatinating video');
    ffmpeg(sourceAudioPath)
      .input(manifestPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c:v copy', '-c:a aac', '-movflags faststart'])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', () => {
        console.timeEnd('concatinating video');
        resolve(finalVideoPath);
      })
      .output(finalVideoPath)
      .run();
  });
};
