const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

/**
 *
 *  "-c:a aac",
    "-ac 2",
    "-b:a 128K",
    "-ar 48000",
    "-profile:a aac_low"
 */

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
    ffmpeg(sourceAudioPath)
      .input(manifestPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c:v copy', '-c:a aac', '-movflags faststart'])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', () => resolve(finalVideoPath))
      .output(finalVideoPath)
      .run();
  });
};
