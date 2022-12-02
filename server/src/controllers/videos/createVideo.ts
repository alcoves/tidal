import url from 'url'
import Joi from 'joi'
import path from 'path'
import queues from '../../queues/queues'

import globals from '../../config/globals'

import { db } from '../../config/db'
import { v4 as uuidv4 } from 'uuid'
import { generateS3Uri } from '../../lib/s3'
import { IngestionJobData } from '../../types'

// export async function enqueueIngestionJob(videoFileId: string) {
//   const videoId = uuidv4()
//   const ingestionId = uuidv4()
//   const jobName = 'ingestion'
//   const queueName = 'ingestion'

//   const location = generateS3Uri({
//     Bucket: globals.tidalBucket,
//     Key: `assets/videos/${videoId}/files/${videoFileId}`,
//   })

//   const ingestionJob: IngestionJobData = {
//     input,
//     videoId,
//     videoFileId,
//     s3OutputUri: videoInputLocation,
//   }

//   await db.video.create({
//     data: {
//       location,
//       id: videoId,
//       files: {
//         create: {
//           input,
//           type: 'ORIGINAL',
//           id: ingestionId,
//           location: videoInputLocation,
//         },
//       },
//     },
//   })

//   await queues[queueName].queue.add(jobName, ingestionJob)
// }

export async function createVideo(req, res) {
  const schema = Joi.object({
    uploadId: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  // await enqueueIngestionJob(value.input)

  return res.status(202).end()
}
