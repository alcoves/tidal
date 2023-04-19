import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppService } from './app.service';
import { S3Service } from './s3/s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          port: configService.get('REDIS_PORT'),
          host: configService.get('REDIS_HOST'),
        },
      }),
      inject: [ConfigService],
    }),
    JobsModule,
    ProcessorsModule,
  ],
})
export class AppModule {}
