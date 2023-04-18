import { JobsService } from './jobs.service';
import { CreateJobDto, JOB_TYPES } from './dto/create-job.dto';
import { Post, Body, Controller, BadRequestException } from '@nestjs/common';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() jobs: CreateJobDto[]) {
    if (!jobs?.length) return new BadRequestException('You must specify jobs');
    jobs.map((job) => {
      switch (job.type) {
        case JOB_TYPES.AUDIO_TRANSCODE:
          return this.jobsService.audioTranscode(job);
        case JOB_TYPES.SEGMENTATION:
          return this.jobsService.segmentation(job);
        case JOB_TYPES.CONCATENATION:
          return this.jobsService.concatenation(job);
        case JOB_TYPES.VIDEO_TRANSCODE:
          return this.jobsService.videoTranscode(job);
        default:
          return new BadRequestException('Invalid job type');
      }
    });
  }
}
