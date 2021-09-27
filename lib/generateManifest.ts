import { AssetInterface } from "../models/models"

export function generateManifest(asset: AssetInterface): string {
  let manifest = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-INDEPENDENT-SEGMENTS
  `
  for (const r of asset.renditions.sort((a, b) => (a.width < b.width) ? 1 : -1)) {
    if (r.status === "completed") {
      manifest += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},AVERAGE-BANDWIDTH=${r.bandwidth},CODECS="${r.codecs}",RESOLUTION=${r.width}x${r.height},CLOSED-CAPTIONS=NONE
${process.env.CDN_URL}/v/${asset._id}/${r._id}/stream.m3u8
          `
    }
  }
  return manifest
}