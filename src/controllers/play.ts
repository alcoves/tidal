import s3, { s3URI } from '../lib/s3'
import { db } from '../config/db'
import { TIDAL_CDN_ENDPOINT } from '../config/globals'

export async function getMainPlayback(req, res) {
  const { playbackId } = req.params

  const playback = await db.playback.findUnique({
    where: { id: playbackId },
    include: {
      video: true,
      transcodes: {
        where: { playbackId },
      },
    },
  })

  if (!playback?.transcodes?.length) return res.sendStatus(400)

  const mainUri = playback.transcodes[0].s3Uri.replace('playlist.m3u8', 'main.m3u8')

  const { Body } = await s3
    .getObject({
      Key: s3URI(mainUri).Key,
      Bucket: s3URI(mainUri).Bucket,
    })
    .promise()
  if (!Body) return res.sendStatus(400)

  const main = Body.toString()
  // console.log('main', main)

  const split = main.split('\n')

  const extm3u = split[0]
  const ext_x_version_7 = split[1]
  const stream_inf = split[2]
  const playlist_uri = split[3]

  const dynamicMain = [extm3u, ext_x_version_7]

  const manifestUri = `${TIDAL_CDN_ENDPOINT}/tidal/assets/videos/${playback.video.id}/transcodes/${playback.transcodes[0].id}/playlist.m3u8`

  dynamicMain.push(stream_inf)
  dynamicMain.push(manifestUri)

  res.setHeader('content-type', 'audio/mpegurl')
  const finalOutput = dynamicMain.join('\n')
  // console.log(finalOutput)
  return res.status(200).send(finalOutput)
}
