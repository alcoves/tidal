import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'

export interface GetVideoTranscodeCommand {
  opts: {
    crf?: number
  }
  width: number
  input: string
  output: string
}

export interface GetAudioTranscodeCommand {
  input: string
  output: string
}

export interface GetPackageCommand {
  type: string
  pkgDir: string
  inputFile: string
  folderName: string
}

export interface VideoPreset {
  name: string
  width: number
  height: number
  getPackageCommand: (args: GetPackageCommand) => string
  getTranscodeCommand: (args: GetVideoTranscodeCommand) => string
}

export interface AudioPreset {
  name: string
  getPackageCommand: (args: GetPackageCommand) => string
  getTranscodeCommand: (args: GetAudioTranscodeCommand) => string
}

export interface WebhookJobData {
  data: any
  returnValue: any
  isFailed: boolean
  id: string | undefined
  name: string | undefined
  progress: number | object
  queueName: string | undefined
}

export interface WebhookJob extends Job {
  data: WebhookJobData
}

export interface Workflow {
  id: string
  name: string
  chunked: boolean
  webhookURL: string
}

export interface ImportAssetData {
  id: string
  input: string
  output: string
}

export interface ImportAssetJob extends Job {
  data: ImportAssetData
}

export interface TranscodeJobData {
  input: string
  cmd: string
  output: string
}

export interface TranscodeJob extends Job {
  data: TranscodeJobData
}

export interface PackageJobInput {
  path: string
  cmd: string
}

export interface PackageJobData {
  inputs: PackageJobInput[]
  output: string
}

export interface PackageJob extends Job {
  data: PackageJobData
}

export interface ConcatJobData {
  input: string
  output: string
}

export interface ConcatJob extends Job {
  data: ConcatJobData
}

export interface ExportJobData {
  input: string
  output: string
}

export interface ExportJob extends Job {
  data: ExportJobData
}

export interface MetadataFormat {
  size: string
  bit_rate: string
  duration: string
  filename: string
  nb_streams: number
  start_time: string
  format_name: string
  nb_programs: number
  probe_score: number
  format_long_name: string
  tags: {
    encoder: string
    major_brand: string
    minor_version: string
    compatible_brands: string
  }
}

export interface MetadataStream {
  avg_frame_rate: string
  bit_rate: string
  bits_per_raw_sample: string
  chroma_location: string
  closed_captions: number
  codec_long_name: string
  codec_name: string
  codec_tag: string
  codec_tag_string: string
  codec_type: string
  coded_height: number
  coded_width: number
  display_aspect_ratio: string
  disposition: {
    attached_pic: number
    clean_effects: number
    comment: number
    default: number
    dub: number
    forced: number
    hearing_impaired: number
    karaoke: number
    lyrics: number
    original: number
    timed_thumbnails: number
    visual_impaired: number
  }
  duration: string
  duration_ts: number
  has_b_frames: number
  height: number
  index: number
  is_avc: string
  level: number
  nal_length_size: string
  nb_frames: string
  pix_fmt: string
  profile: string
  r_frame_rate: string
  refs: number
  sample_aspect_ratio: string
  start_pts: number
  start_time: string
  tags: {
    handler_name: string
    language: string
    vendor_id: string
  }
  time_base: string
  width: number
}

export interface Metadata {
  format: MetadataFormat
  audio: MetadataStream[]
  video: MetadataStream[]
}

// Deprecate

export interface TidalQueue {
  name: string
  queue: Queue
  worker: Worker
  scheduler: QueueScheduler
}

export interface TidalJob {
  cmd?: string
  input?: string
  output?: string
  tmpDir?: string
  parentId?: string
  webhooks?: boolean
}
