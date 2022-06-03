import { FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'
import { Job, Queue, Worker, QueueScheduler } from 'bullmq'

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
export interface TidalWebhookBody {
  data: any
  returnValue: any
  isFailed: boolean
  id: string | undefined
  name: string | undefined
  progress: number | object
  queueName: string | undefined
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

export interface TidalQueue {
  name: string
  queue: Queue
  worker: Worker
  scheduler: QueueScheduler
}

export interface TidalJob {
  cmd?: string | string[]
  input?: string
  output?: string
  tmpDir?: string
  parentId?: string
  webhooks: boolean
}

export interface FFprobeJobData {
  input: string
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
