import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { S3Service } from '../s3/s3.service';
import { TranscodeProcessor } from './transcode.processor';
import { JOB_FLOWS, JOB_QUEUES } from '../config/configuration';
import { SegmentationProcessor } from './segmentation.processor';
import { ConcatenationProcessor } from './concatination.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: JOB_QUEUES.TRANSCODE },
      { name: JOB_QUEUES.SEGMENTATION },
      { name: JOB_QUEUES.CONCATENATION },
    ),
    BullModule.registerFlowProducer({ name: JOB_FLOWS.CHUNKED_TRANSCODE }),
  ],
  providers: [
    S3Service,
    TranscodeProcessor,
    SegmentationProcessor,
    ConcatenationProcessor,
  ],
})
export class ProcessorsModule {}
