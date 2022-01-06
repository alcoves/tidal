import AWS from 'aws-sdk'
import fs from 'fs-extra'
import mime from 'mime-types'

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

import * as path from 'path'

export async function uploadDir(localPath: string, remotePath: string) {
  // Recursive getFiles from
  // https://stackoverflow.com/a/45130990/831465
  async function getFiles(dir: string): Promise<string | string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      dirents.map(dirent => {
        const res = path.resolve(dir, dirent.name)
        return dirent.isDirectory() ? getFiles(res) : res
      })
    )
    return Array.prototype.concat(...files)
  }

  const files = (await getFiles(localPath)) as string[]
  const uploads = files.map(filePath => {
    const uploadKey = `${remotePath}/${path.relative(localPath, filePath)}`
    console.log(`Uploading ${filePath} to ${uploadKey}`)
    return s3
      .upload({
        Key: uploadKey,
        Bucket: defaultBucket,
        ContentType: mime.lookup(filePath),
        Body: fs.createReadStream(filePath),
      })
      .promise()
  })
  return Promise.all(uploads)
}

export default s3
