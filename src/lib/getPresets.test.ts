import { getPresets, clampPreset } from "./getPresets"
import { Metadata } from "./getMetadata"

describe("clampPreset", () => {
  test("clampPreset generates correct outputs", () => {
    const options = [
      [1920, 1080, 1280, 720],
      [1920, 1080, 1920, 1080],
      [1920, 1080, 2560, 1440],
      [1920, 1080, 3840, 2160]
    ]

    for (const o of options) {
      expect(clampPreset(o[0], o[1], o[2], o[3])).toMatchSnapshot()
    }
  })
})

describe("getPresets", () => {
  test("that presets are generated", () => {
    const metadata: Metadata = {
      audio: {
        index: 0,
      },
      video: {
        index: 0,
        width: 1920,
        height: 1080
      },
      format: {
        width: 1920,
        height: 1080
      }
    }
    expect(getPresets(metadata)).toMatchSnapshot()
  })

  test("that presets are generated", () => {
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
    expect(getPresets(metadata)).toEqual([
      {"defaultMaxRate": 1500, "height": 360, "name": "360", "width": 640},
      {"defaultMaxRate": 8000, "height": 720, "name": "720", "width": 1280},
      {"defaultMaxRate": 12000, "height": 1080, "name": "1080", "width": 1920}
    ])
  })
})
