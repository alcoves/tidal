import { JOB_QUEUES } from '../../config/configuration';

export enum JOB_TYPES {
  TRANSCRIBE = 'transcribe',
  SEGMENTATION = JOB_QUEUES.SEGMENTATION,
  CONCATENATION = JOB_QUEUES.CONCATENATION,
  VIDEO_TRANSCODE = JOB_QUEUES.VIDEO_TRANSCODE,
  AUDIO_TRANSCODE = JOB_QUEUES.AUDIO_TRANSCODE,
}

interface URLResource {
  url: string;
}

interface S3Resource {
  s3: {
    key: string;
    bucket: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class BaseJobInputs {
  type: JOB_TYPES;
}

export class SegmentationJobInputs extends BaseJobInputs {
  command: string;
  input: string;
  output: S3Resource;
}

export class ConcatenationJobInputs extends BaseJobInputs {
  command: string;
  input: URLResource | S3Resource;
  output: S3Resource;
}

export class TranscodeVideoJobInputs extends BaseJobInputs {
  command: string;
  input: URLResource | S3Resource;
  output: S3Resource;
}

export class TranscodeAudioJobInputs extends BaseJobInputs {
  command: string;
  input: URLResource | S3Resource;
  output: S3Resource;
}
