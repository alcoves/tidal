import * as fs from 'fs-extra';

import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOB_QUEUES } from '../types';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { ConcatenationJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.CONCATENATION)
export class ConcatenationProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async createConcatFile(
    paths: string[],
    jobDirectory: string,
  ): Promise<string> {
    const concatFilepath = `${jobDirectory}/concat.txt`;
    const concatFileContents = paths.map((path) => {
      return `file '${path}'`;
    });
    await fs.writeFile(concatFilepath, concatFileContents.join('\n'));
    return concatFilepath;
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as ConcatenationJobInputs;

    // Create the concat file
    const concatFilepath = await this.createConcatFile(
      jobData.segments,
      jobData.jobDirectory,
    );

    await new Promise((resolve: (value: FfmpegResult) => void, reject) => {
      const args = [
        '-f',
        'concat',
        '-protocol_whitelist',
        'file,http,https,tcp,tls',
        '-safe',
        '0',
        '-i',
        concatFilepath,
        '-i',
        jobData.audio,
        '-movflags',
        'faststart',
        '-c',
        'copy',
        jobData.output,
      ];
      const ffmpegProcess = createFFMpeg(args);
      ffmpegProcess.on('progress', (progress: number) => {
        console.log(`Progress`, { progress });
      });
      ffmpegProcess.on('success', (res) => {
        console.log('Conversion successful');
        resolve(res);
      });
      ffmpegProcess.on('error', (error: Error) => {
        console.error(`Conversion failed: ${error.message}`);
        reject('Conversion failed');
      });
    });

    console.info('done');
  }
}
