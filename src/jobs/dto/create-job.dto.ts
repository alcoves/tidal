import { JOB_QUEUES } from '../../types';

export enum JOB_TYPES {
  TRANSCODE = JOB_QUEUES.TRANSCODE,
  TRANSCRIBE = JOB_QUEUES.TRANSCRIBE,
  TRANSCODE_CHUNKED = 'transcode_chunked',
}

export class BaseJobInputs {
  type: JOB_TYPES;
}

export class TranscodeJobInputs extends BaseJobInputs {
  input: string;
  output: string;
  command: string;
}

export class SegmentationJobInputs extends BaseJobInputs {
  input: string;
  output: string;
  video_command: string;
  audio_command: string;
  segmentation_command: string;
}

export class ConcatenationJobInputs extends BaseJobInputs {
  audio: string;
  output: string;
  segments: string[];
  jobDirectory: string;
}
