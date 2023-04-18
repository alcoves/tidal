import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { TranscodeProcessor } from './transcode.processor';
import { SegmentationProcessor } from './segmentation.processor';

@Module({
  providers: [S3Service, TranscodeProcessor, SegmentationProcessor],
})
export class ProcessorsModule {}
