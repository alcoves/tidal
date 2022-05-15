import { Metadata } from '../types'
import { ffprobe, FfprobeData } from 'fluent-ffmpeg'

function transformFfprobeToMetadata(rawMeta: FfprobeData): Metadata {
  // When analyzing a video, we assume that the first video track found is the
  // only video track We don't error when a container has multiple video tracks,
  // but we currently don't support having multiple video streams
  const videoStreams = rawMeta.streams.filter(stream => {
    return stream.codec_type === 'video'
  })

  const audioStreams = rawMeta.streams.filter(stream => {
    return stream.codec_type === 'audio'
  })

  const metadata: Metadata = {
    video: videoStreams[0],
    audio: audioStreams[0],
    format: rawMeta.format,
  }
  return metadata
}

export function getMetadata(uri: string): Promise<Metadata> {
  return new Promise((resolve, reject) => {
    ffprobe(uri, async function (err, rawMetadata) {
      if (err) return reject(err)
      if (!rawMetadata?.streams?.length) {
        return reject(new Error('Metadata did not contain any streams'))
      }
      return resolve(transformFfprobeToMetadata(rawMetadata))
    })
  })
}

export function skipResolution({
  sourceWidth = 0,
  sourceHeight = 0,
  maxWidth = 0,
  maxHeight = 0,
}: {
  sourceWidth: number
  sourceHeight: number
  maxWidth: number
  maxHeight: number
}): boolean {
  if (maxHeight === 0 || maxWidth === 0 || sourceWidth === 0 || sourceHeight === 0) return false
  const maxPixels = maxWidth * maxHeight
  const sourcePixels = sourceWidth * sourceHeight
  if (maxPixels > sourcePixels) return true
  return false
}
