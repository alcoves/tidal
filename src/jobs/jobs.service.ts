// import * as path from 'path';

import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JOB_QUEUES } from '../config/configuration';
import {
  TranscodeJobInputs,
  SegmentationJobInputs,
} from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(JOB_QUEUES.TRANSCODE) private transcodeQueue: Queue,
    @InjectQueue(JOB_QUEUES.SEGMENTATION) private segmentationQueue: Queue,
    @InjectQueue(JOB_QUEUES.CONCATENATION) private concatenationQueue: Queue,
  ) {}

  segmentation(jobInput: SegmentationJobInputs) {
    return this.segmentationQueue.add('segmentation', jobInput);
  }

  transcode(jobInput: TranscodeJobInputs) {
    return this.transcodeQueue.add('transcode', jobInput);
  }
}
