import * as fs from 'fs-extra';

import { Job } from 'bullmq';
import { v4 as uuid } from 'uuid';
import { JOB_QUEUES } from '../types';
import { createFFMpeg } from '../utils/ffmpeg';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConcatenationJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.CONCATENATION)
export class ConcatenationProcessor extends WorkerHost {
  constructor(private configService: ConfigService) {
    super();
  }

  async createConcatFile(paths: string[]): Promise<string> {
    const concatDir = fs.mkdtempSync(`/tmp/concat-${uuid()}`);
    const concatFilepath = `${concatDir}/concat.txt`;
    const concatFileContents = paths.map((path) => {
      return `file '${path}'`;
    });
    await fs.writeFile(concatFilepath, concatFileContents.join('\n'));
    return concatFilepath;
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as ConcatenationJobInputs;

    // Create the concat file
    const concatFilepath = await this.createConcatFile(jobData.segments);

    await new Promise((resolve, reject) => {
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
