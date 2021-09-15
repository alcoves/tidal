import { Preset } from "./getPresets"
import { x264 } from "./ffCommands"
import { Metadata } from "./getMetadata"

describe("ffCommands", () => {
  test("that ffmpeg commands are generated", () => {
    const metadata: Metadata = {
      audio: {
        index: 0,
      },
      video: {
        index: 0,
        width: 2280,
        height: 1080
      },
      format: {
        width: 2280,
        height: 1080
      }
    }

    const presets: Preset[] = [
      {
        name: "360p",
        width: 1920,
        height: 1080,
        defaultMaxRate: 3000
      }
    ]

    expect(x264(metadata, presets)).toEqual([
      "-map",
      "0:v:0",
      "-c:v:0",
      "libx264",
      "-filter:v:0",
      "scale=1920:1920:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-crf",
      "22",
      "-preset",
      "medium",
      "-bf",
      "2",
      "-coder",
      "1",
      "-profile:v:0",
      "high",
    ])
  })
})
