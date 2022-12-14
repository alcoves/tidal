import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { queues } from '../queues'
import globals from '../config/globals'
import s3, { getAssetPaths, getAssetUrls } from '../lib/s3'

export async function createVideo(req, res) {
  const schema = Joi.object({
    uploadId: Joi.string(),
    url: Joi.string().uri(),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  })
  if (error) return res.status(400).json(error)

  const { url, uploadId } = value
  const inputUrl = uploadId
    ? await s3.getSignedUrlPromise('getObject', {
        Bucket: globals.tidalBucket,
        Key: `uploads/${uploadId}`,
      })
    : url

  const jobId = uuid()
  await queues.jobs.queue.add('video', { url: inputUrl }, { jobId })
  const job = await queues.jobs.queue.getJob(jobId)
  return res.json(job)
}

export async function getVideo(req, res) {
  const { videoId } = req.params
  const job = await queues.jobs.queue.getJob(videoId)

  if (job) {
    const j = JSON.stringify(job)
    return res.json({
      ...JSON.parse(j),
      urls: getAssetUrls(videoId),
    })
  }

  const { Body } = await s3
    .getObject({
      Bucket: globals.tidalBucket,
      Key: getAssetPaths(videoId).job,
    })
    .promise()
    .catch(() => {
      return res.sendStatus(400)
    })

  return res.json({
    ...JSON.parse(Body),
    urls: getAssetUrls(videoId),
  })
}
