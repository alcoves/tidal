import * as path from 'path';
import * as fs from 'fs-extra';

import { v4 as uuid } from 'uuid';
import { FlowProducer, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JOB_FLOWS, JOB_QUEUES } from '../types';
import { FfmpegResult, createFFMpeg } from '../utils/ffmpeg';
import {
  ConcatenationJobInputs,
  SegmentationJobInputs,
  TranscodeJobInputs,
} from '../jobs/dto/create-job.dto';
import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';

@Processor(JOB_QUEUES.SEGMENTATION)
export class SegmentationProcessor extends WorkerHost {
  constructor(
    private configService: ConfigService,
    @InjectFlowProducer(JOB_FLOWS.CHUNKED_TRANSCODE)
    private transcodeFlow: FlowProducer,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as SegmentationJobInputs;

    // Create the processing directory
    const tidalDir = this.configService.get('TIDAL_DIR');
    if (!tidalDir) throw new Error('Tidal directory not set');
    const jobDirectory = `${tidalDir}/chunked_transcodes/${uuid()}`;
    await fs.ensureDir(jobDirectory);

    // Move the input file to the processing directory
    const sourceFilepath = `${jobDirectory}/${path.basename(jobData.input)}`;
    await fs.move(jobData.input, sourceFilepath);

    // Setting up directories
    const transcodedAudioDir = `${jobDirectory}/audio`;
    const sourceSegmentsDir = `${jobDirectory}/source_segments`;
    const transcodedSegmentsDir = `${jobDirectory}/transcoded_segments`;

    // Create directories
    await fs.ensureDir(transcodedAudioDir);
    await fs.ensureDir(sourceSegmentsDir);
    await fs.ensureDir(transcodedSegmentsDir);

    // Audio output
    const transcodedAudioPath = `${transcodedAudioDir}/audio.ogg`;
    const transcodedVideoPath = `${jobDirectory}/${jobData.output}`;

    // Segment the input file into 60 second chunks
    await new Promise((resolve: (value: FfmpegResult) => void, reject) => {
      const args = [
        '-i',
        sourceFilepath,
        '-c',
        'copy',
        '-an',
        '-segment_time',
        '60',
        '-f',
        'segment',
        `${sourceSegmentsDir}/%07d.mkv`,
      ];
      const ffmpegProcess = createFFMpeg(args);
      ffmpegProcess.on('progress', (progress: number) => {
        console.log(`Progress`, { progress });
      });
      ffmpegProcess.on('success', (res) => {
        console.log('Conversion successful');
        resolve(res);
      });
      ffmpegProcess.on('error', (error: Error) => {
        console.error(`Conversion failed: ${error.message}`);
        reject('Conversion failed');
      });
    });

    const sourceSegments = await fs.readdir(sourceSegmentsDir);
    const segmentTranscodeChildJobs = sourceSegments.map((segment) => {
      return {
        name: 'transcode',
        data: {
          input: `${sourceSegmentsDir}/${segment}`,
          output: `${transcodedSegmentsDir}/${segment}`,
          command: jobData.video_command,
        } as TranscodeJobInputs,
        queueName: JOB_QUEUES.TRANSCODE,
      };
    });

    const audioTranscodeChildJobs = [
      {
        name: 'transcode',
        data: {
          input: sourceFilepath,
          output: transcodedAudioPath,
          command: '-c:a libopus -b:a 128k -vn',
        } as TranscodeJobInputs,
        queueName: JOB_QUEUES.TRANSCODE,
      },
    ];

    await this.transcodeFlow.add({
      name: 'concatenate',
      queueName: JOB_QUEUES.CONCATENATION,
      data: {
        jobDirectory,
        audio: transcodedAudioPath,
        segments: segmentTranscodeChildJobs.map(({ data }) => {
          return data.output;
        }),
        output: transcodedVideoPath,
      } as ConcatenationJobInputs,
      children: [...audioTranscodeChildJobs, ...segmentTranscodeChildJobs],
    });

    console.info('done');
  }
}
