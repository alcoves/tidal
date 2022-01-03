import AWS from 'aws-sdk'
import fs from 'fs-extra'

AWS.config.update({
  maxRetries: 8,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
})

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  endpoint: process.env.SPACES_ENDPOINT,
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
})

export const defaultBucket = process.env.DEFAULT_BUCKET as string

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
  // TODO :: Add check to make sure it will never delete an entire pod
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

export async function uploadFolder(folderPath: string, uploadPath: string) {
  const files = await fs.readdir(folderPath)

  for (const file of files) {
    await s3
      .upload({
        Bucket: defaultBucket,
        Key: uploadPath,
        Body: fs.createReadStream(`${folderPath}/${file}`),
      })
      .promise()
  }
}

export default s3
