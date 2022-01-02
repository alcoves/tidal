import { db } from '../config/db'
import mime from 'mime-types'
import s3, { defaultBucket } from '../config/s3'

export async function createMultipartUpload(req, res) {
  // TODO :: Validate input body
  const { type, size, chunks } = req.body

  const video = await db.video.create({
    data: {
      type,
      size,
    },
  })

  const { UploadId, Key } = await s3
    .createMultipartUpload({
      ContentType: type,
      Bucket: defaultBucket,
      Key: `v/${video.id}/original.${mime.extension(type)}`,
    })
    .promise()

  const urls: string[] = []
  for (let i = 0; i < chunks; i++) {
    urls.push(
      s3.getSignedUrl('uploadPart', {
        Key,
        UploadId,
        Expires: 43200,
        PartNumber: i + 1,
        Bucket: defaultBucket,
      })
    )
  }

  return res.json({
    status: 'success',
    payload: {
      video,
      upload: {
        urls,
        key: Key,
        uploadId: UploadId,
      },
    },
  })
}
