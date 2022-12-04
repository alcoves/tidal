import { Job, Processor, Queue, Worker } from 'bullmq'

export interface Globals {
  mainM3U8Name: string
  tidalBucket: string
  tidalEndpoint: string
}

export interface QueueFactoryOptions {
  queueName: string
  concurrency: number
  lockDuration: number
  workerDisabled: boolean
  jobHandler: Processor
  onProgress?: (job: Job) => void
  onCompleted?: (job: Job) => void
  onFailed?: (job: Job, err: Error) => void
}

export interface QueueFactory {
  queue: Queue
  worker: Worker
}

export interface PackagingJobData {
  inputs: string[]
  output: string
  videoId: string // needed?
  packageId: string // needed?
}

export interface PackagingJob extends Job {
  data: PackagingJobData
}

export interface TranscodeJobData {
  cmd: string
  input: string
  videoId: string
  output: string
  videoFileId: string
}

export interface TranscodeJob extends Job {
  data: TranscodeJobData
}

export interface WebhookJobData {
  data: any
  state: string
  returnValue: any
  id: string | undefined
  name: string | undefined
  progress: number | object
  queueName: string | undefined
}

export interface WebhookJob extends Job {
  data: WebhookJobData
}

export interface ThumbnailJobOptions {
  fit: string
  time: string
  width: number
  height: number
}

export interface ThumbnailJobData extends ThumbnailJobOptions {
  input: string
  output: string
  videoId: string
  thumbnailId: string
}

export interface ThumbnailJob extends Job {
  data: ThumbnailJobData
}

export interface VideoPreset {
  name: string
  width: number
  height: number
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
    rotate: string
    creation_time: string
    handler_name: string
    language: string
    vendor_id: string
  }
  time_base: string
  width: number
}

export interface Metadata {
  format: MetadataFormat
  streams: MetadataStream[]
}
