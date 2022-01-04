export interface Progress {
  frames: number
  percent: number
  timemark: string
  currentFps: number
  targetSize: number
  currentKbps: number
}

export interface S3Parameters {
  key: string
  bucket: string
}

export interface TranscodeJobData {
  input: S3Parameters
  output: S3Parameters
}

export interface ThumbnailJobData {
  input: S3Parameters
  output: S3Parameters
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
