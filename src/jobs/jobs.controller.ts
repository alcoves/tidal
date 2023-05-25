import { JobsService } from './jobs.service';
import {
  JOB_TYPES,
  BaseJobInputs,
  TranscodeJobInputs,
  SegmentationJobInputs,
} from './dto/create-job.dto';
import {
  Get,
  Post,
  Body,
  Controller,
  BadRequestException,
  Param,
} from '@nestjs/common';

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
        case JOB_TYPES.CHUNKED_TRANSCODE:
          return this.jobsService.segmentation(job as SegmentationJobInputs);
        default:
          return new BadRequestException('Invalid job type');
      }
    });
  }

  @Post('/clean')
  cleanQueues() {
    return this.jobsService.cleanQueues();
  }

  @Get()
  listJobs() {
    return this.jobsService.listJobs();
  }

  // @Post(':id/retry')
  // retryJob(@Param('id') id: string) {
  //   return this.jobsService.retryJob(id);
  // }

  // @Get(':id')
  // getJob(@Param('id') id: string) {
  //   return this.jobsService.getJob(id);
  // }
}
