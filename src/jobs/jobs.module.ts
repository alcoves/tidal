import { S3Service } from '../s3/s3.service';
import { TranscribeService } from '../transcribe/transcribe.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [JobsController],
  providers: [JobsService, TranscribeService, S3Service],
})
export class JobsModule {}
