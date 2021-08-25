import { Metadata } from "./getMetadata"
import { Preset } from "./getPresets"

// CalcMaxBitrate uses the videos original bitrate to determine what the max should be
// func CalcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
// vidRatio := float64(desiredWidth) / float64(originalWidth)
// return int(vidRatio * float64(bitrate) / 1000)
// }

function calcResizeFilter (w: number): string {
  return `scale=${w}:${w}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
}

function getX264Args (m: Metadata, p: Preset, streamId: number): string[] {
  let videoFilter = calcResizeFilter(p.width)
  if (m.video.r_frame_rate) {
    console.info("Applying framerate to video filter")
    videoFilter += `,fps=fps=${m.video.r_frame_rate}`
  }

  const commands = [
    "-map",
    "0:v:0",
    `-c:v:${streamId}`,
    "libx264",
    `-filter:v:${streamId}`,
    videoFilter,
    "-crf", "22",
    "-preset", "medium",
    "-bf", "2",
    "-coder", "1",
    `-profile:v:${streamId}`, "high"
  ]

  if (m?.format?.bit_rate) {
    // TODO :: apply max bitrate
    // https://github.com/bkenio/tidal/blob/main/utils/x264.go
  } else {
    // TODO :: apply default bitrates
  }

  return commands
}

export function x264 (metadata: Metadata, presets: Preset[]): string[] {
  const args: string[] = []
  presets.forEach((p, i) => {
    const x264Args = getX264Args(metadata, p, i)
    x264Args.map((a) => args.push(a))
  })
  return args
}
