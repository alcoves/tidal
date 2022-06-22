import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'

export interface Progress {
  frames: number
  percent: number
  timemark: string
  currentFps: number
  targetSize: number
  currentKbps: number
}

export interface FFmpegArgs {
  job?: Job
  input: string
  output: string
  commands: string[]
}

export interface Metadata {
  audio: FfprobeStream
  video: FfprobeStream
  format: FfprobeFormat
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