import _ from 'lodash'
import path from 'path'
import AWS from 'aws-sdk'
import fs from 'fs-extra'
import mime from 'mime-types'
import { ListObjectsV2Request, Object as _Object } from 'aws-sdk/clients/s3'

AWS.config.update({
  maxRetries: 8,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
})

export const s3 = new AWS.S3({
  region: 'us-east-1',
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

export async function getSignedURL(urlParams: { Bucket: string; Key: string }): Promise<string> {
  return s3.getSignedUrlPromise('getObject', {
    Key: urlParams.Key,
    Bucket: urlParams.Bucket,
    Expires: 86400 * 1, // 1d
  })
}

export function amazonS3URI(s3Url: string): { Bucket: string; Key: string } {
  const s3UrlRe = /^[sS]3:\/\/(.*?)\/(.*)/

  if (!s3Url) throw new Error('Expected S3 URL argument')
  const match = s3Url.match(s3UrlRe)
  if (!match) throw new Error(`Not a valid S3 URL: ${s3Url}`)

  return {
    Bucket: match[1],
    Key: match[2],
  }
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

export async function s3Readdir(params: ListObjectsV2Request, contents: _Object[] = []) {
  const { Contents, NextContinuationToken } = await s3.listObjectsV2(params).promise()
  if (Contents?.length) Contents.forEach(p => contents.push(p))

  if (NextContinuationToken) {
    params.ContinuationToken = NextContinuationToken
    return s3Readdir(params, contents)
  }
  return contents
}

export async function uploadFile(
  filePath: string,
  { Bucket, Key }: { Bucket: string; Key: string }
) {
  const fileStream = fs.createReadStream(filePath)
  const params = {
    Bucket,
    Body: fileStream,
    Key: path.normalize(Key),
    ContentType: mime.lookup(filePath),
  }
  console.log(`Uploading to ${path.normalize(Key)}`)
  return s3.upload(params).promise()
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
        const fullPath = path.normalize(`${directory}/${filename}`)
        const uploadKey = path.normalize(`${Key}/${filename}`)
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
