import { Job } from 'bullmq';
import { JOB_QUEUES } from '../types';
import { FfmpegProgress, createFFMpeg } from '../utils/ffmpeg';
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
      ffmpegProcess.on('progress', async (progress: FfmpegProgress) => {
        console.log(`Progress`, { progress });
        if (progress?.progress) await job.updateProgress(progress.progress);
      });
      ffmpegProcess.on('success', (res) => {
        console.log('Conversion successful');
        resolve(res);
      });
      ffmpegProcess.on('error', async (error: Error) => {
        console.error(`Transcode failed: ${error.message}`);
        reject('Transcode failed');
      });
    });

    await job.updateProgress(100);
    console.info('done');
  }
}
