import { FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'

export interface Progress {
  frames: number
  percent: number
  timemark: string
  currentFps: number
  targetSize: number
  currentKbps: number
}

export interface Metadata {
  audio: FfprobeStream
  video: FfprobeStream
  format: FfprobeFormat
}

export interface S3KeyParameters {
  key: string
  bucket: string
}

export interface S3PathParameters {
  path: string
  bucket: string
}

export interface TranscodeJobData {
  inputURL: string
  parentId: string
  entityId: string
  resolution: string
  output: S3KeyParameters
}

export interface ThumbnailJobData {
  input: S3KeyParameters
  output: S3KeyParameters
}

export interface MetadataJobData {
  input: S3KeyParameters
}

export interface TidalWebhookBody {
  data: any
  returnValue: any
  isFailed: boolean
  id: string | undefined
  name: string | undefined
  progress: number | object
  queueName: string | undefined
}

export interface PackageJobData {
  tmpDir: string
  entityId: string
  input: S3KeyParameters
  output: S3PathParameters
}

export interface TidalSettings {
  apiKey: string
  webhookUrl: string
  cdnHostname: string
  bunnyAccessKey: string
  s3Endpoint: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
}
