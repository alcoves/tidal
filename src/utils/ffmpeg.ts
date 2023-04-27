import * as path from 'path';
import * as fs from 'fs-extra';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';

export type FfmpegProgress = {
  frame?: number;
  fps?: number;
  time?: number;
  bitrate?: number;
  speed?: number;
  progress?: number;
  size?: number;
};

export type FfmpegResult = {
  tmpDir: string;
  outputPath: string;
};

export function parseFfmpegTime(timeString: string): number {
  const [hours, minutes, seconds, milliseconds] = timeString
    .split(/[:.]/)
    .map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseFfmpegProgress(stderr: string): FfmpegProgress | null {
  const videoRegex =
    /frame=(\d+)\s+fps=(\d+(\.\d+)?)\s+time=(\d+\:\d+\:\d+\.\d+)\s+bitrate=(\d+(\.\d+)?)\skb\/s\s+speed=(\d+(\.\d+)?)x\s+progress=(\d+(\.\d+)?)\s+/;
  const videoMatch = stderr.match(videoRegex);

  const audioRegex =
    /size=\s*(\d+)\wB\s+time=(\d{2}:\d{2}:\d{2}\.\d{2})\s+bitrate=\s*(\d+(?:\.\d+)?)\wbits\/s\s+speed=\s*(\d+(?:\.\d+)?)x/;
  const audioMatch = stderr.match(audioRegex);

  console.log(stderr);

  if (videoMatch) {
    return {
      frame: parseInt(videoMatch[1], 10),
      fps: parseFloat(videoMatch[2]),
      time: parseFfmpegTime(videoMatch[4]),
      bitrate: parseFloat(videoMatch[5]),
      speed: parseFloat(videoMatch[8]),
      progress: parseFloat(videoMatch[10]),
    };
  } else if (audioMatch) {
    return {
      size: parseInt(audioMatch[1]),
      time: parseFfmpegTime(audioMatch[2]),
      bitrate: parseFloat(audioMatch[3]),
      speed: parseFloat(audioMatch[4]),
    };
  }
  return null;
}

export const createFFMpeg = (args: string[]): ChildProcess & EventEmitter => {
  try {
    console.info('running ffmpeg with args', args.join(' '));

    console.info('creating ffmpeg output directory if needed');
    const outputPath = args[args.length - 1];
    fs.ensureDirSync(path.dirname(outputPath));

    const ffmpegProcess = spawn('ffmpeg', args);
    const emitter = new EventEmitter();

    ffmpegProcess.stderr.on('data', (data: Buffer) => {
      const str = data.toString();
      const progress = parseFfmpegProgress(str);
      if (progress) emitter.emit('progress', progress);
    });

    ffmpegProcess.stderr.on('end', () => {
      emitter.emit('success');
    });

    ffmpegProcess.stderr.on('error', (err: Error) => {
      console.error(err);
      emitter.emit('error', err);
    });

    ffmpegProcess.on('exit', (code: number) => {
      if (code !== 0) {
        console.error(`FFMpeg exited with code ${code}`);
        emitter.emit('error', new Error(`FFMpeg exited with code ${code}`));
      } else {
        emitter.emit('success');
      }
    });

    return Object.assign(ffmpegProcess, emitter);
  } catch (error) {
    console.error(error);
    console.error('something went wrong');
  }
};
