import { db } from '../config/db'
import s3, { defaultBucket } from '../config/s3'
import { CompletedPart } from 'aws-sdk/clients/s3'
import { getMetadata } from '../services/getMetadata'

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

  const signedVideoUrl = await s3.getSignedUrlPromise('getObject', {
    Key: key,
    Bucket: defaultBucket,
  })

  const metadata = await getMetadata(signedVideoUrl)

  const media = await db.video.update({
    where: { id },
    data: {
      status: 'UPLOADED',
      width: metadata.video.width,
      height: metadata.video.height,
      framerate: metadata.video.framrate,
      length: metadata.format.duration || metadata.video.duration,
    },
  })

  return res.json({
    status: 'success',
    payload: { media },
  })
}
