import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { S3Service } from '../s3/s3.service';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JOB_QUEUES } from '../config/configuration';
import { TranscribeService } from '../transcribe/transcribe.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: JOB_QUEUES.VIDEO_TRANSCODE },
      { name: JOB_QUEUES.AUDIO_TRANSCODE },
    ),
  ],
  controllers: [JobsController],
  providers: [JobsService, TranscribeService, S3Service],
})
export class JobsModule {}
