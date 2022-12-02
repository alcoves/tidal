import { Duration } from 'luxon'
import { ffprobe } from './ffmpeg'
import { Metadata } from '../types'
import s3, { parseS3Uri } from './s3'

function parseMetadata(rawMeta: any): Metadata {
  return {
    format: rawMeta.format,
    streams: rawMeta.streams,
  }
}

export function parseTimecodeFromSeconds(secondsString: string): string {
  const seconds = parseInt(secondsString)
  const milliseconds = (parseFloat(secondsString) % 1) * 1000
  return Duration.fromObject({ seconds, milliseconds }).toFormat('hh:mm:ss.SSS')
}

export async function getMetadata(uri: string): Promise<Metadata> {
  const sourceURL = uri.includes('s3://')
    ? await s3.getSignedUrlPromise('getObject', {
        Key: parseS3Uri(uri).Key,
        Bucket: parseS3Uri(uri).Bucket,
        Expires: 86400 * 7, // 7 days
      })
    : uri

  const ffprobeCmd = `-v quiet -print_format json -show_format -show_streams ${sourceURL}`
  const rawMetadata = await ffprobe(ffprobeCmd)
  return parseMetadata(rawMetadata)
}