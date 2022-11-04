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

  const manifests = await Promise.all(
    playback.transcodes.map(t => {
      const mainUri = t.s3Uri.replace('playlist.m3u8', 'main.m3u8')
      return s3
        .getObject({
          Key: s3URI(mainUri).Key,
          Bucket: s3URI(mainUri).Bucket,
        })
        .promise()
    })
  ).catch(err => {
    console.error('There was an error fetching transcode playlists', err)
  })

  const mainManifest = playback.transcodes.reduce((acc: string[], cv, i) => {
    const manifest = manifests[i].Body.toString()
    const [extm3u, ext_x_version_7, stream_inf, playlist_uri] = manifest.split('\n')
    const manifestUri = `${TIDAL_CDN_ENDPOINT}/tidal/assets/videos/${playback.video.id}/transcodes/${cv.id}/playlist.m3u8`

    if (i === 0) {
      // On the first loop, we have to enter the ext information
      acc.push(extm3u)
      acc.push(ext_x_version_7)
    }

    acc.push(stream_inf)
    acc.push(manifestUri)

    return acc
  }, [])

  res.setHeader('content-type', 'audio/mpegurl')
  const finalOutput = mainManifest.join('\n')
  // console.log(finalOutput)
  return res.status(200).send(finalOutput)
}
