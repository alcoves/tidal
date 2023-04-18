import { JobsService } from './jobs.service';
import {
  JOB_TYPES,
  BaseJobInputs,
  TranscodeJobInputs,
} from './dto/create-job.dto';
import { Post, Body, Controller, BadRequestException } from '@nestjs/common';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() jobs: BaseJobInputs[]) {
    if (!jobs?.length) return new BadRequestException('You must specify jobs');
    jobs.map((job) => {
      switch (job.type) {
        case JOB_TYPES.TRANSCODE:
          return this.jobsService.transcode(job as TranscodeJobInputs);
        default:
          return new BadRequestException('Invalid job type');
      }
    });
  }
}
