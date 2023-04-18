import { JobsService } from './jobs.service';
import {
  JOB_TYPES,
  BaseJobInputs,
  ConcatenationJobInputs,
  SegmentationJobInputs,
  TranscodeAudioJobInputs,
  TranscodeVideoJobInputs,
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
        case JOB_TYPES.AUDIO_TRANSCODE:
          return this.jobsService.audioTranscode(
            job as TranscodeAudioJobInputs,
          );
        case JOB_TYPES.SEGMENTATION:
          return this.jobsService.segmentation(job as SegmentationJobInputs);
        case JOB_TYPES.CONCATENATION:
          return this.jobsService.concatenation(job as ConcatenationJobInputs);
        case JOB_TYPES.VIDEO_TRANSCODE:
          return this.jobsService.videoTranscode(
            job as TranscodeVideoJobInputs,
          );
        default:
          return new BadRequestException('Invalid job type');
      }
    });
  }
}
