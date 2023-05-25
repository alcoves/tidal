// import * as path from 'path';

import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JOB_QUEUES } from '../types';
import {
  TranscodeJobInputs,
  SegmentationJobInputs,
} from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(JOB_QUEUES.TRANSCODE) private transcodeQueue: Queue,
    @InjectQueue(JOB_QUEUES.TRANSCRIBE) private transcribeQueue: Queue,
    @InjectQueue(JOB_QUEUES.SEGMENTATION) private segmentationQueue: Queue,
  ) {}

  segmentation(jobInput: SegmentationJobInputs) {
    this.segmentationQueue.add(`segment ${jobInput.input}`, jobInput);
  }

  transcode(jobInput: TranscodeJobInputs) {
    return this.transcodeQueue.add('transcode', jobInput);
  }

  // async retryJob(jobId: string) {
  //   // await this.segmentationQueue.clean(0, 1000 * 10);
  //   // await this.segmentationQueue.obliterate({ force: true });
  //   // const job = await this.transcodeQueue.getJob(jobId);
  //   // job.moveToFailed(new Error('test'), job.token);
  //   // await job.retry();
  // }

  // async getJob(jobId: string) {
  //   const job = await this.transcodeQueue.getJob(jobId);
  //   return {
  //     job,
  //     status: await job.getState(),
  //     children: await job.getDependencies(),
  //     dependency_count: await job.getDependenciesCount(),
  //   };
  // }

  async cleanQueues() {
    await this.transcodeQueue.clean(0, 1000 * 10);
    await this.transcribeQueue.clean(0, 1000 * 10);
    await this.segmentationQueue.clean(0, 1000 * 10);
  }

  async listJobs() {
    const queuesToQuery = Object.values(JOB_QUEUES);

    const jobs = await Promise.all(
      queuesToQuery.map((queueName) => {
        return this[`${queueName}Queue`].getJobs();
      }),
    );

    const stats = await Promise.all(
      queuesToQuery.map(async (queueName) => {
        const queueRef = this[`${queueName}Queue`];
        return {
          [queueName]: {
            counts: await queueRef.getJobCounts(),
          },
        };
      }),
    );

    return {
      queues: queuesToQuery,
      stats,
      jobs,
    };
  }
}
