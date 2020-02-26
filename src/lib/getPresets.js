const ffmpeg = require('fluent-ffmpeg');
const presets = require('./presets.json');

const getDimensions = (metadata) => {
  return metadata.streams.reduce(
    (acc, { width, height }) => {
      if (width) acc.width = width;
      if (height) acc.height = height;
      return acc;
    },
    { width: 0, height: 0 }
  );
};

// TODO :: Add audio compression command to preset

module.exports = ({ sourceFile }) => {
  return new Promise((resolve, reject) => {
    console.time('getting video presets');
    ffmpeg.ffprobe(sourceFile, (err, metadata) => {
      if (err) reject(err);
      const selectedPresets = [];
      const { width } = getDimensions(metadata);

      if (width >= 1280) {
        selectedPresets.push({
          presetName: '720p',
          ffmpegCmdStr: presets['720p'].join(' '),
        });
      }

      if (width >= 1920) {
        selectedPresets.push({
          presetName: '1080p',
          ffmpegCmdStr: presets['1080p'].join(' '),
        });
      }

      if (width >= 2560) {
        selectedPresets.push({
          presetName: '1440p',
          ffmpegCmdStr: presets['1440p'].join(' '),
        });
      }

      if (width >= 3840) {
        selectedPresets.push({
          presetName: '2160p',
          ffmpegCmdStr: presets['2160p'].join(' '),
        });
      }

      console.timeEnd('getting video presets');
      resolve(selectedPresets);
    });
  });
};
