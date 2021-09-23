import { Rendition } from "../models/models"
import { Metadata } from "./getMetadata"

const RESOLUTIONS = {
  240: {
    name: "240p",
    width: 352,
    height: 240,
    bandwidth: 300,
  },
  360: {
    name: "360p",
    width: 480,
    height: 360,
    bandwidth: 300,
  },
  480: {
    name: "480p",
    width: 858,
    height: 480,
    bandwidth: 300,
  },
  720: {
    name: "720p",
    width: 1280,
    height: 720,
    bandwidth: 300,
  },
  1080: {
    name: "1080p",
    width: 1280,
    height: 720,
    bandwidth: 300,
  },
  1440: {
    name: "1440p",
    width: 1920,
    height: 1080,
    bandwidth: 300,
  },
  2160: {
    name: "2160p",
    width: 3860,
    height: 2160,
    bandwidth: 300,
  },
}

function getVideoFilter(width: number): string {
  return `scale=${width}:${width}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
}

export function getRenditions(metadata: Metadata): Rendition[] {
  const hlsDefaults = "-hls_playlist_type event -hls_time 4 -method PUT"

  const renditions: Rendition[] = [{
    status:"queued",
    codecs: "mp4a.40.2,avc1.640020",
    name: RESOLUTIONS[240].name,
    width: RESOLUTIONS[240].width,
    height: RESOLUTIONS[240].height,
    bandwidth: RESOLUTIONS[240].bandwidth,
    command: `-c:v libx264 -crf 26 -vf ${getVideoFilter(RESOLUTIONS[240].width)} ${hlsDefaults}`
  }]

  if (metadata.video.width > RESOLUTIONS[360].width) {
    renditions.push({
      status:"queued",
      codecs: "mp4a.40.2,avc1.640020",
      name: RESOLUTIONS[360].name,
      width: RESOLUTIONS[360].width,
      height: RESOLUTIONS[360].height,
      bandwidth: RESOLUTIONS[360].bandwidth,
      command: `-c:v libx264 -crf 26 -vf ${getVideoFilter(RESOLUTIONS[360].width)} ${hlsDefaults}`
    })
  }

  return renditions
}