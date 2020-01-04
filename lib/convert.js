const path = require('path');
const util = require('util');
const uuid = require('uuid');
const fs = require('fs-extra');
const mime = require('mime-types');
const s3 = require('../config/s3');

const { request } = require('./api');
const { exec } = require('child_process');

const BUCKET_NAME = 'media-bken';
const execProm = util.promisify(exec);

const commandArrayToObj = (string) => {
  return string.split('\n').reduce((acc, cv) => {
    const [key, value] = cv.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
};

const streamingExec = ({ ffmpegCommands, metadata, videoId, fileName }) => {
  return new Promise((resolve, reject) => {
    try {
      // If the max buffer is not set, it is very hard to debug the error produced from exec
      const cmdStream = exec(ffmpegCommands, { maxBuffer: 1024 * 1024 * 1024 });
      // cmdStream.stderr.on('data', (error) => {
      //   console.error(error);
      // });
      cmdStream.stdout.on('data', (data) => {
        const split = data.split('\n');
        if (split.some((v) => v.indexOf('frame') >= 0)) {
          const stats = commandArrayToObj(data);
          const fileDuration = metadata.duration;
          const secondsProcessed = stats.out_time_ms / 1000 / 1000;

          const timeRemaining =
            (fileDuration - secondsProcessed) /
            parseFloat(stats.speed.split('x'));

          const percentCompleted = (
            (secondsProcessed / fileDuration) *
            100
          ).toFixed(2);

          console.log('percentCompleted', percentCompleted);
          console.log('time remaining', timeRemaining);

          request({
            method: 'patch',
            url: `/videos/${videoId}`,
            data: {
              files: {
                [fileName.split('.')[0]]: {
                  status: 'processing',
                  percentCompleted,
                },
              },
            },
          });
        }
      });
      cmdStream.on('exit', (code) => {
        console.log('exiting ffmpeg', code);
        code === 0 ? resolve(code) : reject(code);
      });
    } catch (error) {
      console.error(error);
    }
  });
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

class Conversion {
  constructor({ videoId, sourcePath, thumbnail }) {
    if (isValidUrl(sourcePath)) {
      console.log(
        'source file path was a url, setting ffmpeg to stream process'
      );
      this.sourcePath = sourcePath;
    } else {
      console.log('source file was not a url, using local path instead');
      this.sourcePath = `${path.resolve(sourcePath)}`;
    }

    if (thumbnail) {
      this.thumbnail = true;
    }

    this.videoId = videoId;
    this.outPath = `${path.resolve(`./tmp/${uuid()}`)}`;
    this.commands = `ffmpeg -i ${this.sourcePath}`;
  }

  pre(commands) {
    const splitCommands = this.commands.split('ffmpeg')[1];
    this.commands = `ffmpeg ${commands} ${splitCommands}`;
    return this;
  }

  add(commands) {
    this.commands = `${this.commands} ${commands}`;
    return this;
  }

  async metadata() {
    const { stdout } = await execProm(
      `ffprobe -v error -show_format -show_streams ${this.sourcePath}`
    );

    return commandArrayToObj(stdout);
  }

  async process(fileName) {
    try {
      if (!fileName)
        throw new Error('fileName must be provided as first argument');

      if (!this.thumbnail) {
        await request({
          method: 'patch',
          url: `/videos/${this.videoId}`,
          data: {
            files: {
              [fileName.split('.')[0]]: {
                conversionStartTime: new Date(),
              },
            },
          },
        });
      }

      const outFilePath = `${this.outPath}/${fileName}`;
      await fs.mkdirp(this.outPath);

      console.log(this.commands);
      console.log('starting processing of video');

      const convertCommands = {
        ffmpegCommands: `${this.commands} ${outFilePath}`,
        metadata: await this.metadata(),
        videoId: this.videoId,
        fileName,
      };

      await streamingExec(convertCommands);
      console.log('ended processing of video');

      const s3Res = await s3
        .upload({
          Bucket: BUCKET_NAME,
          Key: `${this.videoId}/${fileName}`,
          ContentType: mime.lookup(fileName),
          Body: fs.createReadStream(outFilePath),
        })
        .promise();

      if (this.thumbnail) {
        await request({
          method: 'patch',
          url: `/videos/${this.videoId}`,
          data: { thumbnail: s3Res.Location },
        });
      } else {
        await request({
          method: 'patch',
          url: `/videos/${this.videoId}`,
          data: {
            files: {
              [fileName.split('.')[0]]: {
                status: 'completed',
                link: s3Res.Location,
                percentCompleted: 100,
                conversionCompleteTime: new Date(),
              },
            },
          },
        });
      }

      await fs.remove(this.outPath);
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}

module.exports = Conversion;
