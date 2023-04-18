import { JOB_QUEUES } from '../../config/configuration';

export enum JOB_TYPES {
  TRANSCRIBE = 'transcribe',
  SEGMENTATION = JOB_QUEUES.SEGMENTATION,
  CONCATENATION = JOB_QUEUES.CONCATENATION,
  VIDEO_TRANSCODE = JOB_QUEUES.VIDEO_TRANSCODE,
  AUDIO_TRANSCODE = JOB_QUEUES.AUDIO_TRANSCODE,
}

export class CreateJobDto {
  type: JOB_TYPES;
  command: string;
  input: {
    url: string;
  };
  output: {
    s3: {
      bucket: string;
      prefix: string;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
}
