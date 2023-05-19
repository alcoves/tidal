import { JOB_FLOWS } from '../types';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranscodeProcessor } from './transcode.processor';
import { SegmentationProcessor } from './segmentation.processor';

@Module({
  imports: [
    BullModule.registerFlowProducer({ name: JOB_FLOWS.CHUNKED_TRANSCODE }),
  ],
  providers: [TranscodeProcessor, SegmentationProcessor],
})
export class ProcessorsModule {}
