const ffprobe =
  process.env.NODE_ENV === 'production' ? '/opt/ffmpeg/ffprobe' : 'ffprobe';

const parseMetadata = (data) => {
  return JSON.parse(data).streams.reduce((acc, { width, height }) => {
    if (width) acc.width = width;
    if (height) acc.height = height;
    return acc;
  }, {});
};

module.exports = () => {
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
    const metadata = parseMetadata(stdout);
  });
};
