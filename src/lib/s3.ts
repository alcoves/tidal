import path from 'path'
import chalk from 'chalk'
import AWS from 'aws-sdk'
import fs from 'fs-extra'
import mime from 'mime-types'
import readdir from 'recursive-readdir'

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  maxRetries: 8,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
})

const opts: AWS.S3.ClientConfiguration = {
  signatureVersion: 'v4',
}

if (process.env.AWS_ENDPONT) {
  opts.endpoint = new AWS.Endpoint(process.env.AWS_ENDPONT)
}

const s3 = new AWS.S3(opts)

export function s3URI(uri: string) {
  const s3UrlRe = /^[sS]3:\/\/(.*?)\/(.*)/
  const match = uri.match(s3UrlRe)
  if (!match) throw new Error(`Not a valid S3 URI: ${uri}`)

  return {
    Bucket: match[1],
    Key: match[2],
  }
}

export async function uploadDir(inputDir, s3Path: string, bucketName: string) {
  try {
    const files = await readdir(inputDir)
    await Promise.all(
      files.map(f => {
        const uploadPath = path.normalize(`${s3Path}/${path.relative(inputDir, f)}`)
        console.log(chalk.grey(`uploading ${f} to s3://${bucketName}/${uploadPath}`))
        s3.upload({
          Key: uploadPath,
          Bucket: bucketName,
          Body: fs.createReadStream(f),
          ContentType: mime.lookup(uploadPath),
        }).promise()
      })
    )
  } catch (error) {
    console.error(chalk.red.bold(error))
    throw new Error(`failed to upload ${inputDir} to s3://${bucketName}/${s3Path}`)
  }
}

export default s3
