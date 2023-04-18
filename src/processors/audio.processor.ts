import { Job } from 'bull';
import { createFFMpeg } from '../utils/ffmpeg';
import { JOB_QUEUES } from '../config/configuration';
import { TranscodeAudioJobInputs } from '../jobs/dto/create-job.dto';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';

@Processor(JOB_QUEUES.AUDIO_TRANSCODE)
export class AudioTranscodeProcessor {
  @Process()
  async audioTranscode(job: Job<unknown>): Promise<any> {
    // console.info("I'm processing audioTranscode");
    // console.log('audioTranscode', job.data);
    // const jobData = job.data as TranscodeAudioJobInputs;
    // const { outputPath } = await new Promise(
    //   (resolve: (value: { outputPath: string }) => void, reject) => {
    //     const args = ['-i', jobData.input.url, ...jobData.command.split(' ')];
    //     console.log('args', args);
    //     const ffmpegProcess = createFFMpeg(args);
    //     ffmpegProcess.on('progress', (progress: number) => {
    //       console.log(`Progress`, { progress });
    //     });
    //     ffmpegProcess.on('success', ({ outputPath }) => {
    //       console.log('Conversion successful');
    //       resolve({ outputPath });
    //     });
    //     ffmpegProcess.on('error', (error: Error) => {
    //       console.error(`Conversion failed: ${error.message}`);
    //       reject('Conversion failed');
    //     });
    //   },
    // );
    // can't delete tmp dir because upload needs it
    // console.log('UPLOADING');
    // Upload single file to s3
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }
}
