import s3 from '../lib/s3'
import { v4 as uuid } from 'uuid'
import globals from '../config/globals'

export async function createUpload(req, res) {
  const uploadId = uuid()
  const uploadUrl = await s3.getSignedUrlPromise('putObject', {
    Key: `uploads/${uploadId}`,
    Bucket: globals.tidalBucket,
  })
  res.json({ id: uploadId, url: uploadUrl })
}
