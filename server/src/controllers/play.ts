import { db } from '../config/db'
import globals from '../config/globals'

export async function renderVideoPlayer(req, res) {
  const { videoId } = req.params
  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      packages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!video) return res.sendStatus(404)
  if (!video?.packages?.length) return res.sendStatus(400)

  const manifestUrl = video.packages[0].location.replace(
    `s3://${globals.tidalBucket}`,
    globals.tidalEndpoint
  )

  res.render('player', {
    manifestUrl,
  })
}
