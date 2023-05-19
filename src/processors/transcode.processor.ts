import { Job } from 'bullmq';
import { JOB_QUEUES } from '../types';
import { createFFMpeg } from '../utils/ffmpeg';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { TranscodeJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.TRANSCODE)
export class TranscodeProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as TranscodeJobInputs;

    await new Promise((resolve, reject) => {
      const ffmpegProcess = createFFMpeg(jobData.command.split(' '));
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

    await job.updateProgress(100);
    console.info('done');
  }
}
