import { db } from '../config/db'

export async function createVideo(req, res) {
  const video = await db.video.create({ data: {} })
  return res.json({ payload: video })
}
