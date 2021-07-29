import { Metadata } from './getMetadata'
import { Preset } from './getPresets'

// CalcMaxBitrate uses the videos original bitrate to determine what the max should be
// func CalcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
// 	vidRatio := float64(desiredWidth) / float64(originalWidth)
// 	return int(vidRatio * float64(bitrate) / 1000)
// }

function calcResizeFilter (w: number): string {
  return `scale=${w}:${w}:force_original_aspect_ratio=decrease`
  // return `scale=${w}:${w}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
}

function x264 (m: Metadata, p: Preset, streamId: number): string[] {
  const videoFilter = calcResizeFilter(p.width)
  // if (m.video.r_frame_rate) {
  //   console.info('Applying framerate to video filter')
  //   videoFilter += `,fps=fps="${m.video.r_frame_rate}"`
  // }

  const commands = [
    '-map',
    '0:v:0',
    `-c:v:${streamId}`,
    'libx264',
    // `-filter:v:${streamId}`,
    // videoFilter,
    '-crf', '22',
    '-preset', '-medium',
    '-bf', '2',
    '-coder', '1',
    `-profile:v:${streamId}`, 'high'
  ]

  if (m?.format?.bit_rate) {
    // TODO :: apply max bitrate
    // https://github.com/bkenio/tidal/blob/main/utils/x264.go
  } else {
    // TODO :: apply default bitrates
  }

  return commands
}

export function getFfmpegArgs (metadata: Metadata, presets: Preset[]): string[] {
  const opusAudio = [
    '-map', '0:a?:0', '-c:a:0', 'libopus', '-b:a:0', '128k', '-ar:0', '48000'
  ]
  const aacAudio = [
    '-map', '0:a?:0', '-c:a:1', 'aac', '-b:a:1', '128k', '-ar:1', '48000'
  ]
  const dashArgs = [
    '-pix_fmt', 'yuv420p',
    // '-force_key_frames', 'expr:gte(t,n_forced*2)',
    '-use_timeline', '1', '-use_template', '1',
    '-seg_duration', '4', '-streaming', '1',
    // '-adaptation_sets', '\"id=0,streams=v id=1,streams=a\"',
    '-f', 'dash'
  ]

  const args: string[] = []
  presets.forEach((p, i) => {
    const x264Args = x264(metadata, p, i)
    x264Args.map((a) => args.push(a))
  })
  args.push(...opusAudio)
  args.push(...aacAudio)
  args.push(...dashArgs)
  return args
}
