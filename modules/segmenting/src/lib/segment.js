const { exec } = require('child_process');

const ffmpeg =
  process.env.NODE_ENV === 'production' ? '/opt/ffmpeg/ffmpeg' : 'ffmpeg';

module.exports = (signedUrl, videoId) => {
  return new Promise(async (resolve, reject) => {
    const ffmpegCmds = [
      ffmpeg,
      `-i "${signedUrl}"`,
      '-c:v copy',
      '-an',
      '-f segment',
      '-segment_time 10',
      `"http://localhost:3000/segments/${videoId}/%06d.mkv"`,
    ];

    const ffmpegCmd = ffmpegCmds.join(' ');
    console.log('ffmpegCmd', ffmpegCmd);
    exec(ffmpegCmd, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve();
    });
  });
};
