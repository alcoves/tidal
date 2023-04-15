import { Job } from 'bull';
import { JOB_QUEUES } from '../config/configuration';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';

@Processor(JOB_QUEUES.AUDIO_TRANSCODE)
export class AudioTranscodeProcessor {
  @Process()
  async audioTranscode(job: Job<unknown>): Promise<any> {
    console.info("I'm processing audioTranscode");
    console.log('audioTranscode', job.data);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
