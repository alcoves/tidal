const AWS = require('aws-sdk');
const { exec } = require('child_process');
const s3 = new AWS.S3({ region: 'us-east-1' });

const ffmpeg =
  process.env.NODE_ENV === 'production' ? '/opt/ffmpeg/ffmpeg' : 'ffmpeg';

module.exports = ({ videoId, filename }) => {
  return new Promise(async (resolve, reject) => {
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: 'tidal-bken-dev',
      Key: `uploads/${videoId}/${filename}`,
    });

    const ffmpegCmds = [
      ffmpeg,
      `-i "${signedUrl}"`,
      '-c:v copy',
      '-an',
      '-f segment',
      '-segment_time 1',
      `"http://localhost:3000/segments/${videoId}/%06d.mkv"`,
    ];

    const ffmpegCmd = ffmpegCmds.join(' ');
    console.log('ffmpegCmd', ffmpegCmd);

    exec(ffmpegCmd, (error, stdout, stderr) => {
      // ffmpeg early returns even though segments are still uploading
      if (error) reject(error);
      console.log('FFMPEG STDOUT: ' + stdout);
      console.log('FFMPEG STDERR: ' + stderr);
      resolve();
    });
  });
};
