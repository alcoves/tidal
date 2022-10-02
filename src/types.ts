import { Job } from 'bullmq'

export enum AdaptiveTranscodeType {
  video = 'video',
  audio = 'audio',
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

export interface VideoJobData {
  cmd: string
  input: string
  output: string
}

export interface IngestionJobData {
  input: string
  output: string
  entityId: string
}

export interface IngestionJob extends Job {
  data: IngestionJobData
}

export interface VideoJob extends Job {
  data: VideoJobData
}

export interface WebhookJob extends Job {
  data: WebhookJobData
}

export interface MetadataJobData {
  input: string
  assetId: string
}

export interface MetadataJob extends Job {
  data: MetadataJobData
}

export interface ThumbnailJobData {
  fit: string
  time: string
  width: number
  input: string
  height: number
  output: string
  assetId: string
}

export interface ThumbnailJob extends Job {
  data: ThumbnailJobData
}

export interface AdaptiveTranscodeStruct {
  cmd: string
  outputFilename: string
  type: AdaptiveTranscodeType
}

export interface AdaptiveTranscodeJobData {
  input: string
  output: string
  assetId: string
}

export interface AdaptiveTranscodeJob extends Job {
  data: AdaptiveTranscodeJobData
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
