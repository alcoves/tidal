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
  duration?: number;
};

export function parseFfmpegTime(timeString: string): number {
  const [hours, minutes, seconds, milliseconds] = timeString
    .split(/[:.]/)
    .map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseFfmpegProgress(
  stderr: string,
  duration?: number,
): FfmpegProgress | null {
  const videoRegex =
    /frame=(\d+)\s+fps=(\d+(\.\d+)?)\s+time=(\d+\:\d+\:\d+\.\d+)\s+bitrate=(\d+(\.\d+)?)\skb\/s\s+speed=(\d+(\.\d+)?)x\s+progress=(\d+(\.\d+)?)\s+/;
  const videoMatch = stderr.match(videoRegex);

  const audioRegex =
    /size=\s*(\d+)\wB\s+time=(\d{2}:\d{2}:\d{2}\.\d{2})\s+bitrate=\s*(\d+(?:\.\d+)?)\wbits\/s\s+speed=\s*(\d+(?:\.\d+)?)x/;
  const audioMatch = stderr.match(audioRegex);

  const durationPatternMatch = /Duration:\s+(\d{2}):(\d{2}):(\d{2})\.(\d+)/;
  const durationMatch = stderr.match(durationPatternMatch);

  console.log(stderr);

  if (videoMatch) {
    const videoTime = parseFfmpegTime(videoMatch[4]);
    const progress = (videoTime / duration) * 100 || 0;

    return {
      duration,
      frame: parseInt(videoMatch[1], 10),
      fps: parseFloat(videoMatch[2]),
      time: videoTime,
      bitrate: parseFloat(videoMatch[5]),
      speed: parseFloat(videoMatch[8]),
      progress: isFinite(progress) ? progress : 0,
    };
  } else if (audioMatch) {
    const audioTime = parseFfmpegTime(audioMatch[2]);
    const progress = (audioTime / duration) * 100 || 0;

    return {
      duration,
      size: parseInt(audioMatch[1]),
      time: audioTime,
      bitrate: parseFloat(audioMatch[3]),
      speed: parseFloat(audioMatch[4]),
      progress: isFinite(progress) ? progress : 0,
    };
  } else if (durationMatch) {
    return {
      duration: parseFfmpegTime(durationMatch[0].split('Duration: ')[1].trim()),
    };
  }
  return null;
}

export function createFFMpeg(args: string[]): ChildProcess & EventEmitter {
  try {
    let duration = 0;

    console.info('running ffmpeg with args', args.join(' '));

    console.info('creating ffmpeg output directory if needed');
    const outputPath = args[args.length - 1];
    fs.ensureDirSync(path.dirname(outputPath));

    const ffmpegProcess = spawn('ffmpeg', args);
    const emitter = new EventEmitter();

    ffmpegProcess.stderr.on('data', (data: Buffer) => {
      const str = data.toString();
      const progress = parseFfmpegProgress(str, duration);
      if (progress?.duration) duration = progress.duration;
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
}
