import { Asset, AssetInterface } from "../models/models"

export async function generateManifest(asset: AssetInterface): Promise<string> {
  let manifest = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-INDEPENDENT-SEGMENTS
`
  
  const completedRenditions = asset.renditions.filter((r) => r.status === "completed")
  if (completedRenditions.length) {
    // All renditions are completed
    for (const r of completedRenditions.sort((a, b) => (a.width < b.width) ? 1 : -1)) {
      manifest += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},AVERAGE-BANDWIDTH=${r.bandwidth},CODECS="${r.codecs}",RESOLUTION=${r.width}x${r.height},CLOSED-CAPTIONS=NONE
${process.env.CDN_URL}/v/${asset._id}/${r._id}/stream.m3u8
`
    }
  }

  await Asset.findOneAndUpdate({ _id: asset._id }, { $inc : {"views" : 1 }})

  // const livestreamingRenditions = asset.renditions.filter((r) => r.status === "running")
  // if (livestreamingRenditions.length) {
  //   // There is no completed rendition so but we can still return livestreams
  //   for (const r of livestreamingRenditions.sort((a, b) => (a.width < b.width) ? 1 : -1)) {
  //     manifest += `
  // #EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},AVERAGE-BANDWIDTH=${r.bandwidth},CODECS="${r.codecs}",RESOLUTION=${r.width}x${r.height},CLOSED-CAPTIONS=NONE
  // ${process.env.CDN_URL}/v/${asset._id}/${r._id}/stream.m3u8
  // `
  //     break
  //   }
  // }

  return manifest
}