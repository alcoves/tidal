import { Asset } from "../models/models"

export function generateManifest(asset: Asset): string {
  let manifest = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-INDEPENDENT-SEGMENTS
  `
  for (const r of asset.renditions) {
    manifest += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},AVERAGE-BANDWIDTH=${r.bandwidth},CODECS="${r.codecs}",RESOLUTION=${r.width}x${r.height},CLOSED-CAPTIONS=NONE
https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/hls2/stream.m3u8
    `
  }
  return manifest
}