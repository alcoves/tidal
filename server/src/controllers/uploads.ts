import s3 from '../lib/s3'
import { v4 as uuid } from 'uuid'
import envVars from '../config/envVars'

export async function createUpload(req, res) {
  const uploadId = uuid()
  const uploadUrl = await s3.getSignedUrlPromise('putObject', {
    Key: `uploads/${uploadId}`,
    Bucket: envVars.tidalBucket,
  })
  res.json({ id: uploadId, url: uploadUrl })
}
