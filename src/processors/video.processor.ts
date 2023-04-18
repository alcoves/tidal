import * as fs from 'fs-extra';

import { Job } from 'bull';
import { S3Service } from '../s3/s3.service';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { JOB_QUEUES } from '../config/configuration';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { TranscodeVideoJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.VIDEO_TRANSCODE)
export class VideoTranscodeProcessor {
  constructor(private readonly s3Service: S3Service) {}

  @Process()
  async segmentation(job: Job<unknown>): Promise<any> {
    const jobData = job.data as TranscodeVideoJobInputs;

    const { tmpDir, outputPath } = await new Promise(
      (resolve: (value: FfmpegResult) => void, reject) => {
        const args = ['-i', jobData.input, ...jobData.command.split(' ')];
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

    const s3Client = this.s3Service.s3ClientFactory(jobData.output.s3);
    await this.s3Service.uploadFile({
      s3Client,
      filepath: outputPath,
      key: jobData.output.s3.key,
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
