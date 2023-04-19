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
    const remoteOutput = this.s3Service.parseS3Uri(jobData.output);
    console.log('CONCAT', jobData);

    const urls = await Promise.all(
      jobData.segments.map((s3Uri) => {
        const { bucket, key } = this.s3Service.parseS3Uri(s3Uri);
        return this.s3Service.getObjectUrl({
          Key: key,
          Bucket: bucket,
        });
      }),
    );

    // todo: abstract
    const tmpConcatDir = await fs.mkdtemp('/tmp/concat-');
    const concatFilepath = `${tmpConcatDir}/concat.txt`;
    const concatFileContents = urls.map((url) => {
      return `file '${url}'`;
    });
    await fs.writeFile(concatFilepath, concatFileContents.join('\n'));

    const { tmpDir: concatTmpDir, outputPath: concatOutputPath } =
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
          '-movflags',
          'faststart',
          '-c',
          'copy',
          'concatenated.mp4',
        ];
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
      });

    const signedAudioUrl = await this.s3Service.getObjectUrl({
      Key: this.s3Service.parseS3Uri(jobData.audio).key,
      Bucket: this.s3Service.parseS3Uri(jobData.audio).bucket,
    });

    const { tmpDir: remuxTmpDir, outputPath: remuxOutputPath } =
      await new Promise((resolve: (value: FfmpegResult) => void, reject) => {
        const args = [
          '-i',
          signedAudioUrl,
          '-i',
          concatOutputPath,
          '-movflags',
          'faststart',
          '-c',
          'copy',
          'muxed.mp4',
        ];
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
      });

    await this.s3Service.uploadFile({
      filepath: remuxOutputPath,
      bucket: remoteOutput.bucket,
      key: remoteOutput.key,
    });

    await fs.remove(concatTmpDir);
    await fs.remove(remuxTmpDir);
    console.info('done');
  }
}
