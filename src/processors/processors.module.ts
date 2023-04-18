import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { AudioTranscodeProcessor } from './audio.processor';
import { VideoTranscodeProcessor } from './video.processor';
import { SegmentationProcessor } from './segmentation.processor';

@Module({
  providers: [
    S3Service,
    SegmentationProcessor,
    AudioTranscodeProcessor,
    VideoTranscodeProcessor,
  ],
})
export class ProcessorsModule {}
