import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { AudioTranscodeProcessor } from './audio.processor';
import { SegmentationProcessor } from './segmentation.processor';

@Module({
  providers: [S3Service, SegmentationProcessor, AudioTranscodeProcessor],
})
export class ProcessorsModule {}
