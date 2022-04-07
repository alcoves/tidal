import _ from 'lodash'
import AWS from 'aws-sdk'
import fs from 'fs-extra'
import mime from 'mime-types'
import { getSettings } from '../utils/redis'

AWS.config.update({
  maxRetries: 8,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
})

let s3

getSettings()
  .then(settings => {
    s3 = new AWS.S3({
      signatureVersion: 'v4',
      region: 'us-east-1',
      endpoint: settings.s3Endpoint,
      accessKeyId: settings.s3AccessKeyId,
      secretAccessKey: settings.s3SecretAccessKey,
    })
  })
  .catch(error => {
    console.error('Failed to get gettings from Redis', error)
  })

export async function getSignedURL(urlParams: { Bucket: string; Key: string }) {
  return s3.getSignedUrlPromise('getObject', {
    Key: urlParams.Key,
    Bucket: urlParams.Bucket,
    Expires: 86400 * 1, // 1d
  })
}

export function getUrlParamsFromS3Uri(s3Uri: string) {
  // S3 Uri = s3://bucket/key
  const parts = s3Uri.split('s3://')[1]
  const bucketKeyTuple = parts.split('/')
  const Bucket = bucketKeyTuple.shift() as string
  return { Bucket, Key: bucketKeyTuple.join('/') }
}

export async function deleteFolder({ Bucket, Prefix }: { Bucket: string; Prefix: string }) {
  // TODO :: Make this work for more than 1000 keys
  if (Prefix.length < 1) {
    throw new Error('Prefix length must be greater than 0')
  }

  const { Contents } = await s3.listObjectsV2({ Bucket, Prefix }).promise()
  const deleteObjects: any =
    Contents?.map(({ Key }) => {
      return { Key }
    }) || []

  return s3
    .deleteObjects({
      Bucket,
      Delete: {
        Quiet: false,
        Objects: deleteObjects,
      },
    })
    .promise()
}

export async function uploadFolder(
  directory: string,
  { Bucket, Key }: { Bucket: string; Key: string }
) {
  const BATCH_SIZE = 50

  const files = await fs.readdir(directory)
  const batches = _.chunk(files, BATCH_SIZE)

  for (const batch of batches) {
    console.log(`Uploading ${batch.length} files`)
    await Promise.all(
      batch.map(filename => {
        const fullPath = `${directory}/${filename}`
        const uploadKey = `${Key}/${filename}`
        console.log(`Uploading ${fullPath} to ${uploadKey}`)
        return s3
          .upload({
            Bucket,
            Key: uploadKey,
            ContentType: mime.lookup(filename),
            Body: fs.createReadStream(fullPath),
          })
          .promise()
      })
    )
  }
}

export default s3
