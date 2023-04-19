import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { S3Service } from '../s3/s3.service';
import { JOB_FLOWS } from '../config/configuration';
import { TranscodeProcessor } from './transcode.processor';
import { SegmentationProcessor } from './segmentation.processor';
import { ConcatenationProcessor } from './concatination.processor';

@Module({
  imports: [
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
