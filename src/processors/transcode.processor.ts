import * as path from 'path';
import * as fs from 'fs-extra';

import { Job } from 'bullmq';
import { v4 as uuid } from 'uuid';
import { JOB_QUEUES } from '../types';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { TranscodeJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.TRANSCODE)
export class TranscodeProcessor extends WorkerHost {
  constructor(private configService: ConfigService) {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as TranscodeJobInputs;

    const tidalDir = this.configService.get('TIDAL_DIR');
    if (!tidalDir) throw new Error('Tidal directory not set');
    const jobDirectory = `${tidalDir}/tmp/${uuid()}`;
    await fs.ensureDir(jobDirectory);

    const tmpOutputPath = `${jobDirectory}/${path.basename(jobData.output)}`;

    await new Promise((resolve: (value: FfmpegResult) => void, reject) => {
      const args = [
        '-i',
        jobData.input,
        ...jobData.command.split(' '),
        tmpOutputPath,
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

    await fs.move(tmpOutputPath, jobData.output);
    await fs.remove(jobDirectory);
    console.info('done');
  }
}
