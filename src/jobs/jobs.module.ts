import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TranscribeService } from '../transcribe/transcribe.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, TranscribeService, S3Service],
})
export class JobsModule {}
