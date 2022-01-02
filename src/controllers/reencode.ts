import { db } from '../config/db'
import { optimizeOriginal } from '../services/x264'

export async function reencodeVideo(req, res) {
  await optimizeOriginal(req.params.videoId)
  const video = await db.video.findFirst({
    where: { id: req.params.videoId },
  })
  return res.json({ payload: video })
}
