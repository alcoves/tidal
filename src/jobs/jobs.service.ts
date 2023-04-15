import { TranscribeService } from '../transcribe/transcribe.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  constructor(private readonly transcribeService: TranscribeService) {}

  create(job: CreateJobDto) {
    switch (job.type) {
      case 'transcribe':
        if (job.mode === 'batch') {
          return this.transcribeService.transcribeOneBatch();
        } else if (job.mode === 'sync') {
          return this.transcribeService.transcribeOne({
            input: job.input,
            output: job.output,
          });
        } else {
          return new BadRequestException(`Invalid ${job.type} job mode`);
        }
      default:
        return new BadRequestException('Invalid job type');
    }
  }

  findAll() {
    return 'This action returns all jobs';
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
