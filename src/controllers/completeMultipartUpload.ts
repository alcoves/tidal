import { db } from '../config/db'
import s3, { defaultBucket } from '../config/s3'
import { CompletedPart } from 'aws-sdk/clients/s3'
import { getMetadata, parseFramerate } from '../services/ffmpeg'

export async function completeMultipartUpload(req, res) {
  const { id, key, uploadId } = req.body

  // TODO :: Make this work for greater than 1000 part uploads
  const { Parts } = await s3
    .listParts({
      Key: key,
      UploadId: uploadId,
      Bucket: defaultBucket,
    })
    .promise()

  const mappedParts: CompletedPart[] =
    Parts?.map(({ ETag, PartNumber }) => {
      return { ETag, PartNumber } as CompletedPart
    }) || []

  await s3
    .completeMultipartUpload({
      Key: key,
      UploadId: uploadId,
      Bucket: defaultBucket,
      MultipartUpload: { Parts: mappedParts },
    })
    .promise()

  const s3Params = {
    Key: key,
    Bucket: defaultBucket,
  }

  const signedVideoUrl = await s3.getSignedUrlPromise('getObject', s3Params)

  const metadata = await getMetadata(signedVideoUrl)
  const headRes = await s3.headObject(s3Params).promise()
  const framerate = parseFramerate(metadata?.video?.r_frame_rate)

  const media = await db.video.update({
    where: { id },
    data: {
      framerate,
      status: 'UPLOADED',
      size: headRes?.ContentLength,
      width: metadata?.video?.width,
      height: metadata?.video?.height,
      length: metadata?.format?.duration || metadata?.video?.duration,
    },
  })

  return res.json({
    status: 'success',
    payload: { media },
  })
}
