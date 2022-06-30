import { Duration } from 'luxon'
import { ffprobe } from './child_process'
import {
  Metadata,
  AudioPreset,
  VideoPreset,
  GetPackageCommand,
  GetVideoTranscodeCommand,
  GetAudioTranscodeCommand,
} from '../types'

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
  const ffprobeCmd = `-v quiet -print_format json -show_format -show_streams ${uri}`
  const rawMetadata = await ffprobe(ffprobeCmd)
  return parseMetadata(rawMetadata)
}

export function getVideoPresets(width: number, height: number): VideoPreset[] {
  const longestEdge = width > height ? width : height
  return videoPresets.filter(p => longestEdge >= p.width)
}

export function getAudioPresets(): AudioPreset[] {
  return audioPresets
}

function x264Defaults(args: GetVideoTranscodeCommand): string {
  const { opts, width, output, input, metadata } = args

  const videoFilters = [
    `scale=${width}:${width}:force_original_aspect_ratio=decrease`,
    'scale=trunc(iw/2)*2:trunc(ih/2)*2',
  ]

  if (metadata?.video[0]?.tags?.rotate) {
    // 0 = 90CounterCLockwise and Vertical Flip (default)
    // 1 = 90Clockwise
    // 2 = 90CounterClockwise
    // 3 = 90Clockwise and Vertical Flip
    const rotateInt = parseInt(metadata?.video[0]?.tags?.rotate)
    switch (rotateInt) {
      case 90:
        videoFilters.push(`transpose=1`)
        break
      // case -90:
      //   videoFilters.push(`transpose=2`)
      //   break
      // case 180:
      //   videoFilters.push(`transpose=1`)
      //   break
      // case -180:
      //   videoFilters.push(`transpose=1`)
      //   break
      // case 270:
      //   videoFilters.push(`transpose=1`)
      //   break
      // case -270:
      //   videoFilters.push(`transpose=1`)
      //   break
    }
  }

  const vfString = videoFilters.join(',')
  return `-i ${input} -an -c:v libx264 -crf ${opts.crf} -preset medium -vf ${vfString} ${output}`
}

function opus(args: GetAudioTranscodeCommand) {
  const { output, input } = args
  return `-i ${input} -vn -c:a libopus -b:a 128k ${output}`
}

function aac(args: GetAudioTranscodeCommand) {
  const { output, input } = args
  return `-i ${input} -vn -c:a aac -b:a 128k ${output}`
}

function getPackageCommand(args: GetPackageCommand) {
  const { type, inputFile, pkgDir, folderName } = args
  switch (type) {
    case 'video':
      return `in=${inputFile},stream=video,output="${pkgDir}/${folderName}/${inputFile}",playlist_name="${pkgDir}/${folderName}/playlist.m3u8",iframe_playlist_name="${pkgDir}/${folderName}/iframes.m3u8"`
    case 'audio':
      return `in=${inputFile},stream=audio,output="${pkgDir}/${folderName}/${inputFile}",playlist_name="${pkgDir}/${folderName}/playlist.m3u8",hls_group_id=audio,hls_name="ENGLISH"`
    default:
      throw new Error(`invalid package command type: ${type}`)
  }
}

export const audioPresets: AudioPreset[] = [
  // {
  //   name: 'aac_128k',
  //   getTranscodeCommand: aac,
  //   getPackageCommand: getPackageCommand,
  // },
  {
    name: 'opus_128k',
    getTranscodeCommand: opus,
    getPackageCommand: getPackageCommand,
  },
]

export const videoPresets: VideoPreset[] = [
  {
    name: 'x264_144p',
    width: 256,
    height: 144,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_240p',
    width: 426,
    height: 240,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_360p',
    width: 640,
    height: 360,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_480p',
    width: 854,
    height: 480,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_720p',
    width: 1280,
    height: 720,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_1080p',
    width: 1920,
    height: 1080,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_1440p',
    width: 2560,
    height: 1440,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
  {
    name: 'x264_2160p',
    width: 3840,
    height: 2160,
    getTranscodeCommand: x264Defaults,
    getPackageCommand: getPackageCommand,
  },
]