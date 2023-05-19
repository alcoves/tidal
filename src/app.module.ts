import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TranscribeService } from './transcribe/transcribe.service';
import { ProcessorsModule } from './processors/processors.module';

@Module({
  providers: [AppService, TranscribeService],
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
          db: configService.get('REDIS_DB'),
          port: configService.get('REDIS_PORT'),
          host: configService.get('REDIS_HOST'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    JobsModule,
    ProcessorsModule,
  ],
})
export class AppModule {}
