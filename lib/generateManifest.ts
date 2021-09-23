import { AssetInterface } from "../models/models"

// TODO :: Sort renditions such that the 720p is loaded first
// See mux.com manifests as an example
export function generateManifest(asset: AssetInterface): string {
  let manifest = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-INDEPENDENT-SEGMENTS
  `
  for (const r of asset.renditions) {
    if (r.status === "completed") {
      manifest += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},AVERAGE-BANDWIDTH=${r.bandwidth},CODECS="${r.codecs}",RESOLUTION=${r.width}x${r.height},CLOSED-CAPTIONS=NONE
https://s3.us-east-2.wasabisys.com/cdn.bken.io/v/${asset._id}/${r._id}/stream.m3u8
          `
    }
  }
  return manifest
}