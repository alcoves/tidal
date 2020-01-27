module.exports = (preset) => {
  if (preset === 'highQuality') {
    return [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-crf 22',
      '-coder 1',
      '-c:a aac',
      '-ac 2',
      '-b:a 320K',
      '-ar 48000',
      '-profile:a aac_low',
    ];
  } else if (preset === 'hd720') {
    return [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=1280:-2',
      '-crf 27',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 128K',
      '-ar 48000',
      '-profile:a aac_low',
    ];
  } else if (preset === 'hd1080') {
    return [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=1920:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ];
  } else if (preset === 'hd1440') {
    return [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=2560:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ];
  } else if (preset === 'hd2160') {
    return [
      '-c:v libx264',
      '-preset veryfast',
      '-profile:v high',
      '-vf scale=3840:-2',
      '-crf 26',
      '-coder 1',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-bf 2',
      '-c:a aac',
      '-ac 2',
      '-b:a 192K',
      '-ar 48000',
      '-profile:a aac_low',
    ];
  } else {
    throw new Error(`preset ${preset} is not supported`);
  }
};
