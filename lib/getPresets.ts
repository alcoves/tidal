import { Metadata } from './getMetadata'

interface Preset {
  name: string
  width: number,
  height: number,
  defaultMaxRate: number
}

function clampPreset (w: number, h: number, dw: number, dh: number): boolean {
  if ((w >= dw && h >= dh) || (w >= dh && h >= dw)) {
    return true
  }
  return false
}

export function getPresets (m: Metadata) {
  const presets: Preset[] = [{
    name: '360',
    defaultMaxRate: 1500,
    width: 640,
    height: 360
  }]

  if (clampPreset(m.width, m.height, 1280, 720)) {
    presets.push({
      name: '720',
      defaultMaxRate: 8000,
      width: 1280,
      height: 720
    })
  }

  if (clampPreset(m.width, m.height, 1920, 1080)) {
    presets.push({
      name: '1080',
      defaultMaxRate: 12000,
      width: 1920,
      height: 1080
    })
  }

  if (clampPreset(m.width, m.height, 2560, 1440)) {
    presets.push({
      name: '1440',
      defaultMaxRate: 24000,
      width: 2560,
      height: 1440
    })
  }

  if (clampPreset(m.width, m.height, 3840, 2160)) {
    presets.push({
      name: '2160',
      defaultMaxRate: 50000,
      width: 3840,
      height: 2160
    })
  }

  return presets
}
