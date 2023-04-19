import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { S3Service } from '../s3/s3.service';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JOB_QUEUES } from '../config/configuration';
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
        name: JOB_QUEUES.CONCATENATION,
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
  providers: [JobsService, TranscribeService, S3Service],
})
export class JobsModule {}
