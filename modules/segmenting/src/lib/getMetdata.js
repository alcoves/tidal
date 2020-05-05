const { exec } = require('child_process');

const ffprobe =
  process.env.NODE_ENV === 'production' ? '/opt/ffmpeg/ffprobe' : 'ffprobe';

const parseMetadata = (data) => {
  return JSON.parse(data).streams.reduce((acc, { width, height }) => {
    if (width) acc.width = width;
    if (height) acc.height = height;
    return acc;
  }, {});
};

module.exports = (signedUrl) => {
  return new Promise((resolve, reject) => {
    const ffprobeCmds = [
      ffprobe,
      `-v error`,
      '-show_entries stream=width,height',
      '-of json',
      `"${signedUrl}"`,
    ];

    const ffprobeCmd = ffprobeCmds.join(' ');
    console.log('ffprobeCmd', ffprobeCmd);
    exec(ffprobeCmd, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(parseMetadata(stdout));
    });
  });
};
