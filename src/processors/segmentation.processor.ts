import * as path from 'path';
import * as fs from 'fs-extra';

import { v4 as uuid } from 'uuid';
import { FlowProducer, Job } from 'bullmq';
import { S3Service } from '../s3/s3.service';
import { JOB_FLOWS, JOB_QUEUES } from '../config/configuration';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import {
  ConcatenationJobInputs,
  SegmentationJobInputs,
  TranscodeJobInputs,
} from '../jobs/dto/create-job.dto';
import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';

@Processor(JOB_QUEUES.SEGMENTATION)
export class SegmentationProcessor extends WorkerHost {
  constructor(
    private readonly s3Service: S3Service,
    @InjectFlowProducer(JOB_FLOWS.CHUNKED_TRANSCODE)
    private transcodeFlow: FlowProducer,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as SegmentationJobInputs;

    const remoteInput = this.s3Service.parseS3Uri(jobData.input);
    const remoteOutput = this.s3Service.parseS3Uri(jobData.output);

    const assetId = uuid();
    const remoteSegmentsDir = `source_segments/${assetId}`;
    const remoteTranscodedSegmentsDir = `transcoded_segments/${assetId}`;
    const remoteTranscodedAudioKey = `s3://${remoteInput.bucket}/transcoded_audio/${assetId}/audio.aac`;

    const signedInputUrl = await this.s3Service.getObjectUrl({
      Key: remoteInput.key,
      Bucket: remoteInput.bucket,
    });

    const { tmpDir } = await new Promise(
      (resolve: (value: FfmpegResult) => void, reject) => {
        const args = [
          '-i',
          signedInputUrl,
          ...jobData.segmentation_command.split(' '),
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
      },
    );

    await this.s3Service.uploadDirectory({
      prefix: remoteSegmentsDir,
      bucket: remoteOutput.bucket,
      directory: tmpDir,
    });

    const sourceSegments = await fs.readdir(tmpDir);
    const segmentTranscodeChildJobs = sourceSegments.map((source) => {
      const filename = path.basename(source);
      const remoteSourceSegmentKey = `${remoteSegmentsDir}/${filename}`;
      const remoteTranscodedSegmentKey = `${remoteTranscodedSegmentsDir}/${filename}`;

      return {
        name: 'transcode',
        data: {
          input: `s3://${remoteInput.bucket}/${remoteSourceSegmentKey}`, // The input is a single source segment
          output: `s3://${remoteOutput.bucket}/${remoteTranscodedSegmentKey}`, // The output is a single transcoded segment
          command: jobData.video_command,
        } as TranscodeJobInputs,
        queueName: JOB_QUEUES.TRANSCODE,
      };
    });

    const audioTranscodeChildJobs = [
      {
        name: 'transcode',
        data: {
          input: jobData.input,
          output: remoteTranscodedAudioKey,
          command: '-c:a aac -b:a 128k -vn',
        } as TranscodeJobInputs,
        queueName: JOB_QUEUES.TRANSCODE,
      },
    ];

    await this.transcodeFlow.add({
      name: 'concatenate',
      queueName: JOB_QUEUES.CONCATENATION,
      data: {
        audio: remoteTranscodedAudioKey,
        segments: segmentTranscodeChildJobs.map(({ data }) => {
          return data.output;
        }),
        output: jobData.output, // The output is the final concatenated file
      } as ConcatenationJobInputs,
      children: [...audioTranscodeChildJobs, ...segmentTranscodeChildJobs],
    });

    await fs.remove(tmpDir);
    console.info('done');
  }
}
