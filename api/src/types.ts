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

export interface Preset {
  id: string
  name: string
  cmd: string
  package_cmd: string
  constraints: Constraints
}

interface Constraints {
  width: number
  height: number
}

export interface MetadataJobData {
  input: string
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

export interface FFmpegJobData {
  cmd: string
  input: string
  tmpDir: string
  parentId: string
  webhooks: boolean
}

export interface PackageJobData {
  tmpDir: string
  package_cmds: string[]
}

export interface OutputJobData {
  tmpDir: string
  output: string
}

export interface TidalSettings {
  apiKey: string
  webhookUrl: string
  cdnHostname: string
  bunnyAccessKey: string
  s3Endpoint: string
  s3AccessKeyId: string
  nfsMountPath: string
  s3SecretAccessKey: string
}
