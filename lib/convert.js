const fs = require('fs-extra');
const path = require('path');
const util = require('util');

const { exec } = require('child_process');

const execProm = util.promisify(exec);

const commandArrayToObj = string => {
  return string.split('\n').reduce((acc, cv) => {
    const [key, value] = cv.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
};

const streamingExec = (cmd, meta) => {
  return new Promise((resolve, reject) => {
    const cmdStream = exec(cmd);
    cmdStream.stdout.on('data', data => {
      const split = data.split('\n');
      if (split.some(v => v.indexOf('frame') >= 0)) {
        const stats = commandArrayToObj(data);
        // console.log(meta);
        // console.log(stats);

        const fileDuration = meta.duration;
        const secondsProcessed = stats.out_time_ms / 1000 / 1000;

        const timeRemaining =
          (fileDuration - secondsProcessed) /
          parseFloat(stats.speed.split('x'));

        const percentComplete = (
          (secondsProcessed / fileDuration) *
          100
        ).toFixed(2);

        console.log('percentComplete', percentComplete);
        console.log('time remaining', timeRemaining);
      }
    });
    // cmdStream.stderr.on('data', data => {
    //   console.log(data);
    // });
    cmdStream.on('exit', code => {
      code === 0 ? resolve(code) : reject(code);
    });
  });
};

class Conversion {
  constructor(filePath) {
    this.filePath = `${path.resolve(filePath)}`;
    this.commands = `ffmpeg -i ${this.filePath}`;
  }

  add(commands) {
    this.commands = `${this.commands} ${commands}`;
    return this;
  }

  async metadata() {
    const { stdout } = await execProm(
      `ffprobe -v error -show_format -show_streams ${this.filePath}`
    );

    return commandArrayToObj(stdout);
  }

  async process() {
    try {
      fs.mkdirSync('./data/export');
    } catch (error) {}

    const startTime = Date.now();
    await streamingExec(this.commands, await this.metadata());
    return { time: Date.now() - startTime };
  }
}

module.exports = Conversion;
