const ffmpeg = require('fluent-ffmpeg');

module.exports = async (sourcePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(sourcePath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata);
    });
  });
};
