import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JobsModule } from './jobs/jobs.module';
import { TranscribeService } from './transcribe/transcribe.service';

@Module({
  providers: [AppService, TranscribeService],
  controllers: [AppController],
  imports: [ConfigModule.forRoot({
    cache: true,
  }), JobsModule],
})
export class AppModule {}
