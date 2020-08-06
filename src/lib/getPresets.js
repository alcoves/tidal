const presets = require('./presets');

module.exports = (width, framerate) => {
  const selectedPresets = [];

  selectedPresets.push(presets('libx264-480p', framerate));
  // selectedPresets.push(presets('libvpx_vp9-480p', framerate));

  if (width >= 1280) {
    selectedPresets.push(presets('libx264-720p', framerate));
    // selectedPresets.push(presets('libvpx_vp9-720p', framerate));
  }

  if (width >= 1920) {
    selectedPresets.push(presets('libx264-1080p', framerate));
    // selectedPresets.push(presets('libvpx_vp9-1080p', framerate));
  }

  if (width >= 2560) {
    selectedPresets.push(presets('libx264-1440p', framerate));
    // selectedPresets.push(presets('libvpx_vp9-1440p', framerate));
  }

  if (width >= 3840) {
    selectedPresets.push(presets('libx264-2160p', framerate));
    // selectedPresets.push(presets('libvpx_vp9-2160p', framerate));
  }

  return selectedPresets;
};
