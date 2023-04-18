import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JOB_QUEUES } from '../config/configuration';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(JOB_QUEUES.SEGMENTATION) private segmentationQueue: Queue,
    @InjectQueue(JOB_QUEUES.CONCATENATION) private concatenationQueue: Queue,
    @InjectQueue(JOB_QUEUES.VIDEO_TRANSCODE) private videoTranscodeQueue: Queue,
    @InjectQueue(JOB_QUEUES.AUDIO_TRANSCODE) private audioTranscodeQueue: Queue,
  ) {}

  segmentation(jobInput: CreateJobDto) {
    return this.audioTranscodeQueue.add(jobInput);
  }

  concatenation(jobInput: CreateJobDto) {
    return 'concatenation';
  }

  videoTranscode(jobInput: CreateJobDto) {
    return 'transcode';
  }

  audioTranscode(jobInput: CreateJobDto) {
    return this.audioTranscodeQueue.add(jobInput);
  }
}
