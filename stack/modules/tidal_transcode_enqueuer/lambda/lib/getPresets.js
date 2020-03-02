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

module.exports = (metadata) => {
  const selectedPresets = [];
  const { width } = getDimensions(metadata);

  if (width >= 854) {
    selectedPresets.push({
      presetName: '480p',
      ffmpegCmdStr: presets['480p'].join(' '),
    });
  }

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

  if (!selectedPresets.length) throw new Error('no presets selected');
  return selectedPresets;
};
