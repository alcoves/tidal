const presets = require('./presets.json');

module.exports = (width) => {
  width = parseInt(width);
  const selectedPresets = [];

  selectedPresets.push({
    presetName: 'libx264-480p',
    ffmpegCmdStr: presets['libx264-480p'].cmd.join(' '),
  });

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

    selectedPresets.push({
      presetName: 'libvpx_vp9-1080p',
      ffmpegCmdStr: presets['libvpx_vp9-1080p'].cmd.join(' '),
    });
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

  return selectedPresets;
};
