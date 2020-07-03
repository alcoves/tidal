const presets = require('./presets.json');

function addPreset(name) {
  return {
    ...presets[name],
    cmd: presets[name].cmd.join(' '),
  };
}

module.exports = (width) => {
  const selectedPresets = [];

  selectedPresets.push(addPreset('libx264-480p'));
  // selectedPresets.push(addPreset('libvpx_vp9-480p'));

  if (width >= 1280) {
    selectedPresets.push(addPreset('libx264-720p'));
    // selectedPresets.push(addPreset('libvpx_vp9-720p'));
  }

  if (width >= 1920) {
    selectedPresets.push(addPreset('libx264-1080p'));
    // selectedPresets.push(addPreset('libvpx_vp9-1080p'));
  }

  if (width >= 2560) {
    selectedPresets.push(addPreset('libx264-1440p'));
    // selectedPresets.push(addPreset('libvpx_vp9-1440p'));
  }

  if (width >= 3840) {
    selectedPresets.push(addPreset('libx264-2160p'));
    // selectedPresets.push(addPreset('libvpx_vp9-2160p'));
  }

  return selectedPresets;
};
