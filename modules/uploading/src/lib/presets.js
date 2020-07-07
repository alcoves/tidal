function x264(framerate, width) {
  if (!framerate || !width) {
    throw new Error('framerate and width must be defined');
  }

  const commands = [
    "-c:v libx264",
    "-preset faster",
    "-profile:v high",
    "-bf 3",
    "-g 60",
    "-keyint_min 60",
    "-crf 24",
    "-coder 1",
    "-pix_fmt yuv420p",
    `-vf fps=fps=${framerate},scale=${width}:-2`
  ]

  return commands.join(' ')
}

module.exports = function (presetName, framerate) {
  if (!presetName || !framerate) {
    throw new Error('preset and framerate must be defined');
  }

  if (presetName === 'libx264-480p') {
    return {
      ext: 'mp4',
      preset: 'libx264-480p',
      cmd: x264(framerate, 854)
    }
  } else if (presetName === 'libx264-720p') {
    return {
      ext: 'mp4',
      preset: 'libx264-720p',
      cmd: x264(framerate, 1280)
    }
  } else if (presetName === 'libx264-1080p') {
    return {
      ext: 'mp4',
      preset: 'libx264-1080p',
      cmd: x264(framerate, 1920)
    }
  } else if (presetName === 'libx264-1440p') {
    return {
      ext: 'mp4',
      preset: 'libx264-1440p',
      cmd: x264(framerate, 2360)
    }
  } else if (presetName === 'libx264-2160p') {
    return {
      ext: 'mp4',
      preset: 'libx264-2160p',
      cmd: x264(framerate, 3840)
    }
  } else {
    throw new Error(`preset: ${presetName} not found`);
  }
}