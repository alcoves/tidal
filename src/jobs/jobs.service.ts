import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JOB_QUEUES } from '../config/configuration';
import {
  SegmentationJobInputs,
  ConcatenationJobInputs,
  TranscodeAudioJobInputs,
  TranscodeVideoJobInputs,
} from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(JOB_QUEUES.SEGMENTATION) private segmentationQueue: Queue,
    @InjectQueue(JOB_QUEUES.CONCATENATION) private concatenationQueue: Queue,
    @InjectQueue(JOB_QUEUES.VIDEO_TRANSCODE) private videoTranscodeQueue: Queue,
    @InjectQueue(JOB_QUEUES.AUDIO_TRANSCODE) private audioTranscodeQueue: Queue,
  ) {}

  segmentation(jobInput: SegmentationJobInputs) {
    return this.segmentationQueue.add(jobInput);
  }

  concatenation(jobInput: ConcatenationJobInputs) {
    return this.concatenationQueue.add(jobInput);
  }

  videoTranscode(jobInput: TranscodeVideoJobInputs) {
    return this.videoTranscodeQueue.add(jobInput);
  }

  audioTranscode(jobInput: TranscodeAudioJobInputs) {
    return this.audioTranscodeQueue.add(jobInput);
  }
}
