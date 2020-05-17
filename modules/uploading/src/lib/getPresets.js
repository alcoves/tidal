const presets = require('./presets.json');

module.exports = (width) => {
  const selectedPresets = [];

  selectedPresets.push({
    presetName: 'libvpx_vp9-480p',
    ffmpegCmdStr: presets['libvpx_vp9-480p'].cmd.join(' '),
  });

  if (width >= 1280) {
    selectedPresets.push({
      presetName: 'libvpx_vp9-720p',
      ffmpegCmdStr: presets['libvpx_vp9-720p'].cmd.join(' '),
    });
  }

  if (width >= 1920) {
    selectedPresets.push({
      presetName: 'libvpx_vp9-1080p',
      ffmpegCmdStr: presets['libvpx_vp9-1080p'].cmd.join(' '),
    });
  }

  if (width >= 2560) {
    selectedPresets.push({
      presetName: 'libvpx_vp9-1440p',
      ffmpegCmdStr: presets['libvpx_vp9-1440p'].cmd.join(' '),
    });
  }

  if (width >= 3840) {
    selectedPresets.push({
      presetName: 'libvpx_vp9-2160p',
      ffmpegCmdStr: presets['libvpx_vp9-2160p'].cmd.join(' '),
    });
  }

  return selectedPresets;
};
