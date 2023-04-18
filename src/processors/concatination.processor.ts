import * as fs from 'fs-extra';

import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { S3Service } from '../s3/s3.service';
import { JOB_QUEUES } from '../config/configuration';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { ConcatenationJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.CONCATENATION)
export class ConcatenationProcessor extends WorkerHost {
  constructor(private readonly s3Service: S3Service) {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as ConcatenationJobInputs;

    // TODO: Implement concatenation
    // Create a list of concatenation urls
    // write file to tmp
    // run ffmpeg concat
    // upload to s3

    const { tmpDir } = await new Promise(
      (resolve: (value: FfmpegResult) => void, reject) => {
        const args = ['-i', jobData.input, ...jobData.command.split(' ')];
        console.log('args', args);
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
      },
    );

    const { bucket, key } = this.s3Service.parseS3Uri(jobData.output);
    await this.s3Service.uploadDirectory({
      prefix: key,
      bucket: bucket,
      directory: tmpDir,
    });

    await fs.remove(tmpDir);
    console.info('done');
  }
}
