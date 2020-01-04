const util = require('util');
const ffmpegStrToObj = require('./ffmpegStrToObj');

const { exec } = require('child_process');
const execProm = util.promisify(exec);

module.exports = async (sourcePath) => {
  const cmd = `ffprobe -v error -show_format -show_streams ${sourcePath}`;
  const { stdout } = await execProm(cmd);
  return ffmpegStrToObj(stdout);
};
