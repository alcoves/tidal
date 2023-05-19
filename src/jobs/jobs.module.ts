import { JOB_QUEUES } from '../types';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TranscribeService } from '../transcribe/transcribe.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: JOB_QUEUES.TRANSCODE,
        defaultJobOptions: {
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 1000 * 10,
          },
        },
      },
      {
        name: JOB_QUEUES.SEGMENTATION,
        defaultJobOptions: {
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 1000 * 10,
          },
        },
      },
      {
        name: JOB_QUEUES.TRANSCRIBE,
        defaultJobOptions: {
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 1000 * 10,
          },
        },
      },
    ),
  ],
  controllers: [JobsController],
  providers: [JobsService, TranscribeService],
})
export class JobsModule {}
