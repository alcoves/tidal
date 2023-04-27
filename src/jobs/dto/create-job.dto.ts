import { JOB_QUEUES, JOB_FLOWS } from '../../types';

export enum JOB_TYPES {
  TRANSCODE = JOB_QUEUES.TRANSCODE,
  TRANSCRIBE = JOB_QUEUES.TRANSCRIBE,
  CHUNKED_TRANSCODE = JOB_FLOWS.CHUNKED_TRANSCODE,
}

export class BaseJobInputs {
  type: JOB_TYPES;
}

export class TranscodeJobInputs extends BaseJobInputs {
  input: string;
  output: string;
  command: string;
}

export interface SegmentationOptions {
  segment_time: string;
}

export class SegmentationJobInputs extends BaseJobInputs {
  input: string;
  output: string;
  command: string;
  segmentation_options: SegmentationOptions;
}

export class ConcatenationJobInputs extends BaseJobInputs {
  audio: string;
  output: string;
  segments: string[];
}
