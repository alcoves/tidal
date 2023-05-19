import * as path from 'path';
import * as fs from 'fs-extra';

import { v4 as uuid } from 'uuid';
import { FlowProducer, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JOB_FLOWS, JOB_QUEUES } from '../types';
import { createFFMpeg } from '../utils/ffmpeg';
import {
  SegmentationJobInputs,
  TranscodeJobInputs,
} from '../jobs/dto/create-job.dto';
import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';
import { getMetadata } from '../utils/ffprobe';

@Processor(JOB_QUEUES.SEGMENTATION)
export class SegmentationProcessor extends WorkerHost {
  constructor(
    private configService: ConfigService,
    @InjectFlowProducer(JOB_FLOWS.CHUNKED_TRANSCODE)
    private transcodeFlow: FlowProducer,
  ) {
    super();
  }

  async createConcatFile(
    concatFilepath: string,
    segments: string[],
  ): Promise<string> {
    const concatFileContents = segments.map((path) => {
      return `file '${path}'`;
    });
    await fs.writeFile(concatFilepath, concatFileContents.join('\n'));
    return concatFilepath;
  }

  async process(job: Job<unknown>): Promise<any> {
    const jobData = job.data as SegmentationJobInputs;
    const tidalDir = this.configService.get('TIDAL_DIR');

    // setting up directories
    const assetId = uuid();
    const transcodingDir = path.normalize(`${tidalDir}/transcoding/${assetId}`);

    // segment dirs
    const sourceSegmentsDir = path.normalize(
      `${transcodingDir}/segments/source`,
    );
    const transcodedSegmentsDir = path.normalize(
      `${transcodingDir}/segments/transcoded`,
    );

    // make sure the directories exist
    await fs.ensureDir(sourceSegmentsDir);
    await fs.ensureDir(transcodedSegmentsDir);

    // getting source metadata
    const transcodedAudioPath = path.normalize(`${transcodingDir}/audio.ogg`);
    const metadata = await getMetadata(jobData.input);
    const hasVideo = metadata?.streams?.some(
      (stream) => stream.codec_type === 'video',
    );
    const hasAudio = metadata?.streams?.some(
      (stream) => stream.codec_type === 'audio',
    );
    if (!hasVideo) throw new Error('Input file has no video stream');

    // Segment the input file into 60 second chunks
    await new Promise((resolve, reject) => {
      const args = [
        '-i',
        jobData.input,
        '-c',
        'copy',
        '-an',
        '-segment_time',
        jobData?.segmentation_options?.segment_time || '30',
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

    const transcodedSegments = [];
    const sourceSegments = await fs.readdir(sourceSegmentsDir);
    const segmentTranscodeChildJobs = sourceSegments.map((segment) => {
      transcodedSegments.push(`${transcodedSegmentsDir}/${segment}`);

      return {
        name: `segment ${segment} for ${path.basename(jobData.input)}`,
        data: {
          command: [
            '-hide_banner',
            '-i',
            `${sourceSegmentsDir}/${segment}`,
            jobData.command,
            `${transcodedSegmentsDir}/${segment}`,
          ].join(' '),
        } as TranscodeJobInputs,
        queueName: JOB_QUEUES.TRANSCODE,
      };
    });

    const audioTranscodeChildJobs = hasAudio
      ? [
          {
            name: `audio for ${path.basename(jobData.input)}`,
            opts: {
              priority: 1,
            },
            data: {
              command: [
                '-hide_banner',
                '-i',
                jobData.input,
                '-c:a libopus -b:a 128k -vn',
                transcodedAudioPath,
              ].join(' '),
            } as TranscodeJobInputs,
            queueName: JOB_QUEUES.TRANSCODE,
          },
        ]
      : [];

    const concatFilepath = path.normalize(`${transcodingDir}/concat.txt`);
    await this.createConcatFile(concatFilepath, transcodedSegments);

    const concatAudio = hasAudio ? ['-i', transcodedAudioPath] : [];
    await this.transcodeFlow.add({
      name: `concatenation for ${path.basename(jobData.input)}`,
      queueName: JOB_QUEUES.TRANSCODE,
      opts: {
        priority: 1,
      },
      data: {
        command: [
          '-hide_banner',
          '-f',
          'concat',
          '-protocol_whitelist',
          'file,http,https,tcp,tls',
          '-safe',
          '0',
          '-y',
          '-i',
          concatFilepath,
          ...concatAudio,
          '-movflags',
          'faststart',
          '-c',
          'copy',
          jobData.output,
        ].join(' '),
      } as TranscodeJobInputs,
      children: [...audioTranscodeChildJobs, ...segmentTranscodeChildJobs],
    });

    console.info('done');
  }
}
