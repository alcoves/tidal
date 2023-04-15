import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, JOB_TYPES } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

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
        default:
          return new BadRequestException('Invalid job type');
      }
    });
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}
