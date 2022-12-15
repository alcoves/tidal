import fs from 'fs-extra'
import sharp from 'sharp'
import { Duration } from 'luxon'
import { Metadata } from '../types'
import s3, { parseS3Uri } from './s3'
import { ffmpeg, ffprobe } from './ffmpeg'

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

export async function createThumbnail(uri: string, tmpDir: string) {
  console.info('creating temporary directory')
  const sourceThumbnail = `${tmpDir}/thumbnail.png`
  const compressedThumbnail = `${tmpDir}/thumbnail.jpeg`

  try {
    console.info('extracting thumbnail')
    await ffmpeg(`-i ${uri} -vframes 1 -ss 00:00:00 ${sourceThumbnail}`)

    console.info('compressing thumbnail')
    await sharp(sourceThumbnail)
      .resize({ width: 1280, height: 720, fit: 'cover' })
      .toFormat('jpeg', { quality: 70 })
      .toFile(compressedThumbnail)

    await fs.remove(sourceThumbnail)
    return compressedThumbnail
  } catch (error) {
    console.error(error)
    throw error
  }
}
