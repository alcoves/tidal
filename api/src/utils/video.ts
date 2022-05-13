// enum Resolution {
//   _240p = '240p',
//   _360p = '360p',
//   _480p = '480p',
//   _720p = '720p',
//   _1080p = '1080p',
//   _1440p = '1440p',
//   _2160p = '2160p',
// }

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

export async function shouldProcess(input: string, resolution: string): Promise<boolean> {
  const resolutionWidth = parseInt(resolution.split('p')[0])
  const metadata = await getMetadata(input)
  if (metadata.video.width && metadata.video.width >= resolutionWidth) {
    return true
  }
  return false
}

export function generateFfmpegCommand(resolution: string): string[] {
  const defaults = [
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-force_key_frames',
    'expr:gte(t,n_forced*2)',
    // HLS Defaults
    '-hls_flags',
    'single_file',
    '-hls_segment_type',
    'fmp4',
    '-hls_playlist_type',
    'vod',
    '-hls_time',
    '4',
    '-master_pl_name',
    'rendition.m3u8',
  ]

  function scaleFilter(w: number) {
    return `scale=${w}:${w}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
  }

  switch (resolution) {
    case '240p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '600k',
        '-bufsize',
        '1200k',
        '-vf',
        scaleFilter(352),
      ]
    case '360p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '800k',
        '-bufsize',
        '1600k',
        '-vf',
        scaleFilter(640),
      ]
    case '480p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '1400k',
        '-bufsize',
        '2800k',
        '-vf',
        scaleFilter(842),
      ]
    case '720p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '2800k',
        '-bufsize',
        '5600k',
        '-vf',
        scaleFilter(1280),
      ]
    case '1080p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '5000k',
        '-bufsize',
        '10000k',
        '-vf',
        scaleFilter(1920),
      ]
    case '1440p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '8000k',
        '-bufsize',
        '16000k',
        '-vf',
        scaleFilter(2560),
      ]
    case '2160p':
      return [
        ...defaults,
        '-crf',
        '26',
        '-maxrate',
        '25000k',
        '-bufsize',
        '50000k',
        '-vf',
        scaleFilter(3840),
      ]
    default:
      return []
  }
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
