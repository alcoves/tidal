import { db } from '../config/db'
import globals from '../config/globals'
import { getPublicUrlFromS3Uri } from '../lib/s3'

export async function renderVideoPlayer(req, res) {
  const { videoId } = req.params
  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      packages: {
        where: { status: 'READY' },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!video) return res.sendStatus(404)
  if (!video?.packages?.length) return res.sendStatus(400)

  res.render('player', {
    manifestUrl: getPublicUrlFromS3Uri(video.packages[0].location) + `/${globals.mainM3U8Name}`,
  })
}
