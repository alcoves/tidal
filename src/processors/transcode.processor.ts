import * as path from 'path';
import * as fs from 'fs-extra';

import { Job } from 'bullmq';
import { S3Service } from '../s3/s3.service';
import { JOB_QUEUES } from '../config/configuration';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import { TranscodeJobInputs } from '../jobs/dto/create-job.dto';

@Processor(JOB_QUEUES.TRANSCODE)
export class TranscodeProcessor extends WorkerHost {
  constructor(private readonly s3Service: S3Service) {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as TranscodeJobInputs;
    const remoteInputs = this.s3Service.parseS3Uri(jobData.input);
    const remoteOutputs = this.s3Service.parseS3Uri(jobData.output);
    const outputFilename = path.basename(remoteOutputs.key);

    const signedUrl = await this.s3Service.getObjectUrl({
      Key: remoteInputs.key,
      Bucket: remoteInputs.bucket,
    });

    const { tmpDir, outputPath } = await new Promise(
      (resolve: (value: FfmpegResult) => void, reject) => {
        const args = [
          '-i',
          signedUrl,
          ...jobData.command.split(' '),
          outputFilename,
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
      },
    );

    await this.s3Service.uploadFile({
      filepath: outputPath,
      key: remoteOutputs.key,
      bucket: remoteOutputs.bucket,
    });

    await fs.remove(tmpDir);
    console.info('done');
  }
}
