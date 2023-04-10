import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { Module } from "@nestjs/common";
import { TranscribeService } from "aws-sdk";

@Module({
  controllers: [JobsController],
  providers: [JobsService, TranscribeService]
})
export class JobsModule {}
