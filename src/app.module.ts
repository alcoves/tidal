import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { TranscribeService } from './transcribe/transcribe.service';
import { S3Service } from './s3/s3.service';

@Module({
  providers: [AppService, TranscribeService, S3Service],
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    JobsModule,
  ],
})
export class AppModule {}
