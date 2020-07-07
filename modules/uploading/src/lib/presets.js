const presets = require('./presets.json');

module.exports = (presetName, framerate) => {
  if (!presetName || !framerate) {
    throw new Error('preset and framerate must be defined');
  }

  const preset = presets[presetName];

  // Constant frame rate mode
  preset.cmd['-vf'] = `fps=${framerate},${preset.cmd['-vf']}`;

  const commands = Object.entries(preset.cmd).map(([k, v]) => {
    return `${k} ${v}`
  })

  preset.cmd = commands.join(' ');
  console.log('command', preset.cmd);
  return preset;
}