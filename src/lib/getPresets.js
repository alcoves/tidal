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

module.exports = (videoPath) => {
  return new Promise((resolve, reject) => {
    console.log('getting video presets');
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      const selectedPresets = [];
      const { width } = getDimensions(metadata);

      if (width >= 1280) {
        selectedPresets.push({
          presetName: 'libx264-720p',
          ffmpegCmdStr: presets['libx264-720p'].cmd.join(' '),
        });
      }

      if (width >= 1920) {
        selectedPresets.push({
          presetName: 'libx264-1080p',
          ffmpegCmdStr: presets['libx264-1080p'].cmd.join(' '),
        });

        // selectedPresets.push({
        //   presetName: 'libvpx_vp9-1080p',
        //   ffmpegCmdStr: presets['libvpx_vp9-1080p'].cmd.join(' '),
        // });
      }

      if (width >= 2560) {
        selectedPresets.push({
          presetName: 'libx264-1440p',
          ffmpegCmdStr: presets['libx264-1440p'].cmd.join(' '),
        });
      }

      if (width >= 3840) {
        selectedPresets.push({
          presetName: 'libx264-2160p',
          ffmpegCmdStr: presets['libx264-2160p'].cmd.join(' '),
        });
      }

      resolve(selectedPresets);
    });
  });
};