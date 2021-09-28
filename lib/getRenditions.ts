import { Types } from "mongoose"
import { Metadata } from "./getMetadata"

const RESOLUTIONS = {
  240: {
    name: "240p",
    width: 426,
    height: 240,
    bandwidth: 250 * 1000,
  },
  360: {
    name: "360p",
    width: 640,
    height: 360,
    bandwidth: 750 * 1000,
  },
  480: {
    name: "480p",
    width: 854,
    height: 480,
    bandwidth: 2000 * 1000,
  },
  720: {
    name: "720p",
    width: 1280,
    height: 720,
    bandwidth: 3500 * 1000,
  },
  1080: {
    name: "1080p",
    width: 1920,
    height: 1080,
    bandwidth: 6000 * 1000,
  },
  1440: {
    name: "1440p",
    width: 2560,
    height: 1440,
    bandwidth: 12000 * 1000,
  },
  2160: {
    name: "2160p",
    width: 3840,
    height: 2160,
    bandwidth: 30000 * 1000,
  },
}

function getVideoFilter(width: number): string {
  return `-vf scale=${width}:${width}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
}

export function getRenditions(metadata: Metadata, assetId: Types.ObjectId): unknown[] {
  const x264Defaults = "-c:v libx264 -crf 24 -preset medium"
  const hlsDefaults = "-hls_playlist_type vod -hls_time 4 -method PUT"

  const renditions: unknown[] = [{
    _id: new Types.ObjectId(),
    asset: assetId,
    status:"queued",
    codecs: "mp4a.40.2,avc1.640020",
    name: RESOLUTIONS[240].name,
    width: RESOLUTIONS[240].width,
    height: RESOLUTIONS[240].height,
    bandwidth: RESOLUTIONS[240].bandwidth,
    command: `${x264Defaults} ${getVideoFilter(RESOLUTIONS[240].width)} ${hlsDefaults}`
  }]

  if (metadata.video.width >= RESOLUTIONS[360].width) {
    const rendition = RESOLUTIONS[360]
    renditions.push({
      _id: new Types.ObjectId(),
      asset: assetId,
      status:"queued",
      codecs: "mp4a.40.2,avc1.640020",
      name: rendition.name,
      width: rendition.width,
      height: rendition.height,
      bandwidth: rendition.bandwidth,
      command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
    })
  }

  if (metadata.video.width >= RESOLUTIONS[480].width) {
    const rendition = RESOLUTIONS[480]
    renditions.push({
      _id: new Types.ObjectId(),
      asset: assetId,
      status:"queued",
      codecs: "mp4a.40.2,avc1.640020",
      name: rendition.name,
      width: rendition.width,
      height: rendition.height,
      bandwidth: rendition.bandwidth,
      command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
    })
  }

  if (metadata.video.width >= RESOLUTIONS[720].width) {
    const rendition = RESOLUTIONS[720]
    renditions.push({
      _id: new Types.ObjectId(),
      asset: assetId,
      status:"queued",
      codecs: "mp4a.40.2,avc1.640020",
      name: rendition.name,
      width: rendition.width,
      height: rendition.height,
      bandwidth: rendition.bandwidth,
      command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
    })
  }

  if (metadata.video.width >= RESOLUTIONS[1080].width) {
    const rendition = RESOLUTIONS[1080]
    renditions.push({
      _id: new Types.ObjectId(),
      asset: assetId,
      status:"queued",
      codecs: "mp4a.40.2,avc1.640020",
      name: rendition.name,
      width: rendition.width,
      height: rendition.height,
      bandwidth: rendition.bandwidth,
      command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
    })
  }

  // if (metadata.video.width >= RESOLUTIONS[1440].width) {
  //   const rendition = RESOLUTIONS[1440]
  //   renditions.push({
  //     _id: new Types.ObjectId(),
  //     asset: assetId,
  //     status:"queued",
  //     codecs: "mp4a.40.2,avc1.640020",
  //     name: rendition.name,
  //     width: rendition.width,
  //     height: rendition.height,
  //     bandwidth: rendition.bandwidth,
  //     command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
  //   })
  // }

  // if (metadata.video.width >= RESOLUTIONS[2160].width) {
  //   const rendition = RESOLUTIONS[2160]
  //   renditions.push({
  //     _id: new Types.ObjectId(),
  //     asset: assetId,
  //     status:"queued",
  //     codecs: "mp4a.40.2,avc1.640020",
  //     name: rendition.name,
  //     width: rendition.width,
  //     height: rendition.height,
  //     bandwidth: rendition.bandwidth,
  //     command: `${x264Defaults} ${getVideoFilter(rendition.width)} ${hlsDefaults}`
  //   })
  // }

  return renditions
}