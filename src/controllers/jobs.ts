import { transcodeQueue } from '../config/queues/transcode'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { metadataQueue, metadataWorker } from '../config/queues/metadata'

export async function transcodeController(req, res) {
  const { input, output } = req.body
  await transcodeQueue.add('transcode', {
    input,
    output,
    ffmpeg_command: '-c:v libx265 -crf 23',
  })
  return res.sendStatus(202)
}

export async function metadataController(req, res) {
  const { input } = req.body
  const { id } = await metadataQueue.add('metadata', { input })
  metadataWorker.on('completed', function (job) {
    if (job.id === id) {
      return res.json(job.data)
    }
  })
  metadataWorker.on('failed', function (job, err) {
    if (job.id === id) {
      return res.status(500).send(err)
    }
  })
}

export async function thumbnailController(req, res) {
  const { input, output } = req.body
  await thumbnailQueue.add('thumbnail', {
    input,
    output,
  })
  return res.sendStatus(202)
}
