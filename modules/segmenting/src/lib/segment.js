const AWS = require("aws-sdk");
const { exec } = require("child_process");

const s3 = new AWS.S3({ region: "us-east-1" });

const ffmpeg =
  process.env.NODE_ENV === "production" ? "/opt/ffmpeg/ffmpeg" : "ffmpeg";
const ffprobe =
  process.env.NODE_ENV === "production" ? "/opt/ffmpeg/ffprobe" : "ffprobe";

const parseMetadata = (data) => {
  return JSON.parse(data).streams.reduce((acc, { width, height }) => {
    if (width) acc.width = width;
    if (height) acc.height = height;
    return acc;
  }, {});
};

module.exports = ({ videoId, filename }) => {
  return new Promise(async (resolve, reject) => {
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: "tidal-bken-dev",
      Key: `uploads/${videoId}/${filename}`,
    });

    const ffprobeCmds = [
      ffprobe,
      `-v error`,
      "-show_entries stream=width,height",
      "-of json",
      `"${signedUrl}"`,
    ];

    const ffprobeCmd = ffprobeCmds.join(" ");
    console.log("ffprobeCmd", ffprobeCmd);

    exec(ffprobeCmd, (error, stdout, stderr) => {
      if (error) reject(error);
      console.log("FFPROBE STDOUT: " + stdout);
      console.log("FFPROBE STDERR: " + stderr);

      const { width, height } = parseMetadata(stdout);

      const ffmpegCmds = [
        ffmpeg,
        `-i "${signedUrl}"`,
        "-c:v copy",
        "-an",
        "-f segment",
        "-segment_time 10",
        `"http://localhost:3000/segments/${videoId}/source/${width}/%06d.mkv"`,
      ];

      const ffmpegCmd = ffmpegCmds.join(" ");
      console.log("ffmpegCmd", ffmpegCmd);

      exec(ffmpegCmd, (error, stdout, stderr) => {
        if (error) reject(error);
        console.log("FFMPEG STDOUT: " + stdout);
        console.log("FFMPEG STDERR: " + stderr);
        resolve(stdout);
      });
    });
  });
};
