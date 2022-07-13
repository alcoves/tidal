import s3, { s3URI } from './s3'
import { Duration } from 'luxon'
import { ffprobe } from './ffmpeg'
import { AdaptiveTranscodeStruct, AdaptiveTranscodeType, Metadata, VideoPreset } from '../types'

const keyframes = ['-g', '60', '-keyint_min', '60', '-force_key_frames', 'expr:gte(t,n_forced*2)']

function parseMetadata(rawMeta: any): Metadata {
  return {
    video: rawMeta.streams.filter(stream => {
      return stream.codec_type === 'video'
    }),
    audio: rawMeta.streams.filter(stream => {
      return stream.codec_type === 'audio'
    }),
    format: rawMeta.format,
  }
}

export function parseTimecodeFromSeconds(secondsString: string): string {
  const seconds = parseInt(secondsString)
  const milliseconds = (parseFloat(secondsString) % 1) * 1000
  return Duration.fromObject({ seconds, milliseconds }).toFormat('hh:mm:ss.SSS')
}

export async function getMetadata(uri: string): Promise<Metadata> {
  console.info('getting source url')
  const sourceURL = uri.includes('s3://')
    ? await s3.getSignedUrlPromise('getObject', {
        Key: s3URI(uri).Key,
        Bucket: s3URI(uri).Bucket,
        Expires: 86400 * 7, // 7 days
      })
    : uri

  const ffprobeCmd = `-v quiet -print_format json -show_format -show_streams ${sourceURL}`
  const rawMetadata = await ffprobe(ffprobeCmd)
  return parseMetadata(rawMetadata)
}

function getAudioPresets(metadata: Metadata): AdaptiveTranscodeStruct[] {
  const hasAudio = Boolean(metadata?.audio?.length)

  if (hasAudio) {
    return [
      {
        outputFilename: 'aac_source.mp4',
        type: AdaptiveTranscodeType.audio,
        cmd: ['-vn', '-c:a', 'aac', '-ac', '2'].join(' '),
      },
      {
        outputFilename: 'opus_128k.mp4',
        type: AdaptiveTranscodeType.audio,
        cmd: ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-ac', '2'].join(' '),
      },
    ]
  }

  return []
}

export function generateAdaptiveTranscodeCommands({
  metadata,
}: {
  metadata: Metadata
}): AdaptiveTranscodeStruct[] {
  const vWidth = metadata?.video[0]?.width || 0
  const vHeight = metadata?.video[0]?.height || 0

  const videoPresets = getAvailiblePresets(vWidth, vHeight).map(v => {
    return {
      outputFilename: `${v.name}.mp4`,
      type: AdaptiveTranscodeType.video,
      cmd: x264Defaults({ width: v.width }),
    }
  })

  const audioPresets = getAudioPresets(metadata)

  return [...audioPresets, ...videoPresets]
}

export function getAvailiblePresets(width: number, height: number): VideoPreset[] {
  const longestEdge = width > height ? width : height
  return videoPresets.filter(p => longestEdge >= p.width)
}

function x264Defaults({ width }: { width: number }): string {
  const videoFilters = [
    `scale=${width}:${width}:force_original_aspect_ratio=decrease`,
    `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
  ]

  return [
    '-vf',
    videoFilters.join(','),
    '-an',
    '-c:v',
    'libx264',
    '-crf',
    '23',
    '-preset',
    'medium',
    '-profile',
    'high',
    '-pix_fmt',
    'yuv420p',
    ...keyframes,
  ].join(' ')
}

export function videoMetadataValidated(metadata: Metadata): boolean {
  if (metadata?.video?.length < 1) return false
  return true
}

const videoPresets: VideoPreset[] = [
  {
    name: 'x264_144p',
    width: 256,
    height: 144,
  },
  {
    name: 'x264_240p',
    width: 426,
    height: 240,
  },
  {
    name: 'x264_360p',
    width: 640,
    height: 360,
  },
  {
    name: 'x264_480p',
    width: 854,
    height: 480,
  },
  {
    name: 'x264_720p',
    width: 1280,
    height: 720,
  },
  {
    name: 'x264_1080p',
    width: 1920,
    height: 1080,
  },
  {
    name: 'x264_1440p',
    width: 2560,
    height: 1440,
  },
  {
    name: 'x264_2160p',
    width: 3840,
    height: 2160,
  },
]
