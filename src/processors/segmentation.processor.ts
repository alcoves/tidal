import * as fs from 'fs-extra';

import { Job } from 'bull';
import { S3Service } from '../s3/s3.service';
import { createFFMpeg } from '../utils/ffmpeg';
import { JOB_QUEUES } from '../config/configuration';
import { SegmentationJobInputs } from '../jobs/dto/create-job.dto';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';

@Processor(JOB_QUEUES.SEGMENTATION)
export class SegmentationProcessor {
  constructor(private readonly s3Service: S3Service) {}

  @Process()
  async segmentation(job: Job<unknown>): Promise<any> {
    console.info('beginning segmentation');
    console.log('segmentation', job.data);
    const jobData = job.data as SegmentationJobInputs;
    console.log('jobData', jobData);

    const { tmpDir } = await new Promise(
      (resolve: (value: { tmpDir: string }) => void, reject) => {
        const args = ['-i', jobData.input, ...jobData.command.split(' ')];
        console.log('args', args);
        const ffmpegProcess = createFFMpeg(args);
        ffmpegProcess.on('progress', (progress: number) => {
          console.log(`Progress`, { progress });
        });
        ffmpegProcess.on('success', ({ tmpDir }) => {
          console.log('Conversion successful');
          resolve({ tmpDir });
        });
        ffmpegProcess.on('error', (error: Error) => {
          console.error(`Conversion failed: ${error.message}`);
          reject('Conversion failed');
        });
      },
    );

    const s3Client = this.s3Service.s3ClientFactory(jobData.output.s3);
    await this.s3Service.uploadDirectory({
      s3Client,
      directory: tmpDir,
      prefix: jobData.output.s3.key,
      bucket: jobData.output.s3.bucket,
    });

    await fs.remove(tmpDir);
    console.info('done');
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }
}
