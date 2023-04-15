import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { TranscribeService } from './transcribe/transcribe.service';
import { S3Service } from './s3/s3.service';
import { BullModule } from '@nestjs/bull';
import { JOB_QUEUES } from './config/configuration';

@Module({
  providers: [AppService, TranscribeService, S3Service],
  controllers: [AppController],
  imports: [
    JobsModule,
    ConfigModule.forRoot({
      cache: true,
    }),
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    BullModule.registerQueue(
      { name: JOB_QUEUES.VIDEO_TRANSCODE },
      { name: JOB_QUEUES.AUDIO_TRANSCODE },
    ),
  ],
})
export class AppModule {}
