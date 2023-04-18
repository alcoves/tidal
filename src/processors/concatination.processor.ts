import * as fs from 'fs-extra';

import { Job } from 'bull';
import { S3Service } from '../s3/s3.service';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { JOB_QUEUES } from '../config/configuration';
import { ConcatenationJobInputs } from '../jobs/dto/create-job.dto';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';

@Processor(JOB_QUEUES.CONCATENATION)
export class ConcatenationProcessor {
  constructor(private readonly s3Service: S3Service) {}

  @Process()
  async concatenation(job: Job<unknown>): Promise<any> {
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

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }
}
