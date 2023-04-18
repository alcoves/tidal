import { JOB_QUEUES } from '../../config/configuration';

export enum JOB_TYPES {
  TRANSCODE = JOB_QUEUES.TRANSCODE,
  TRANSCRIBE = JOB_QUEUES.TRANSCRIBE,
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
  command: string;
}

export class ConcatenationJobInputs extends BaseJobInputs {
  input: string;
  output: string;
  command: string;
}
