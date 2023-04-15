import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { S3Service } from './s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';
import { TranscribeService } from './transcribe/transcribe.service';
import { ProcessorsModule } from './processors/processors.module';

@Module({
  providers: [AppService, TranscribeService, S3Service],
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    JobsModule,
    ProcessorsModule,
  ],
})
export class AppModule {}
