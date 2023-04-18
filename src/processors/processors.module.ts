import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { S3Service } from '../s3/s3.service';
import { JOB_QUEUES } from '../config/configuration';
import { TranscodeProcessor } from './transcode.processor';
import { SegmentationProcessor } from './segmentation.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: JOB_QUEUES.TRANSCODE },
      { name: JOB_QUEUES.SEGMENTATION },
      { name: JOB_QUEUES.CONCATENATION },
    ),
  ],
  providers: [S3Service, TranscodeProcessor, SegmentationProcessor],
})
export class ProcessorsModule {}
