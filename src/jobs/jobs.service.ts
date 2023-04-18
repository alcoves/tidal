// import * as path from 'path';

import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JOB_QUEUES } from '../config/configuration';
import {
  TranscodeJobInputs,
  SegmentationJobInputs,
  ConcatenationJobInputs,
} from './dto/create-job.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectQueue(JOB_QUEUES.TRANSCODE) private transcodeQueue: Queue,
    @InjectQueue(JOB_QUEUES.SEGMENTATION) private segmentationQueue: Queue,
    @InjectQueue(JOB_QUEUES.CONCATENATION) private concatenationQueue: Queue,
  ) {}

  segmentation(jobInput: SegmentationJobInputs) {
    return this.segmentationQueue.add('segmentation', jobInput);
  }

  concatenation(jobInput: ConcatenationJobInputs) {
    return this.concatenationQueue.add('concatenation', jobInput);
  }

  transcode(jobInput: TranscodeJobInputs) {
    return this.transcodeQueue.add('transcode', jobInput);
  }

  transcodeChunked(jobInput: TranscodeJobInputs) {
    // Segment video
    // For each chunk, enqueue transcode job
    // When all chunks are transcoded, enqueue concatenation job
    return this.transcodeQueue.add('transcode', jobInput);
  }

  // async videoSegmentTranscode(jobInput: TranscodeVideoSegmentJobInputs) {
  //   const s3Client = this.s3Service.s3ClientFactory(jobInput.input.s3);
  //   const objects = await this.s3Service.listObjects(s3Client, {
  //     Bucket: jobInput.input.s3.bucket,
  //     Prefix: jobInput.input.s3.key,
  //   });

  //   await Promise.all(
  //     objects.map(async (object) => {
  //       const inputFilename = path.parse(path.basename(object.Key)).name;
  //       const outputFileExtension = jobInput.output.extension || 'mp4';
  //       const outputFilename = `${inputFilename}.${outputFileExtension}`;

  //       const transcodeJob = {
  //         type: JOB_TYPES.VIDEO_SEGMENT_TRANSCODE,
  //         command: jobInput.command,
  //         input: await this.s3Service.getObjectUrl(s3Client, {
  //           Key: object.Key,
  //           Bucket: jobInput.input.s3.bucket,
  //         }),
  //         output: {
  //           s3: {
  //             ...jobInput.output.s3,
  //             key: `${jobInput.output.s3.key}/${outputFilename}`,
  //           },
  //         },
  //       };

  //       this.videoTranscodeQueue.add(transcodeJob);
  //     }),
  //   );
  // }
}
