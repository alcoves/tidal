import { Queue, Worker, QueueScheduler } from 'bullmq'
import { FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'

enum Handler {
  output = 'output',
  ffmpeg = 'ffmpeg',
  ffprobe = 'ffprobe',
  package = 'package',
}

interface Constraints {
  width: number
  height: number
}

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
  cmd: string
  name: string
  queue: string
  handler: Handler
  constraints: Constraints
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
  cmd?: string
  input?: string
  output?: string
  tmpDir?: string
  parentId?: string
  webhooks?: boolean
}
