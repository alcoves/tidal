import path from 'path'
import chalk from 'chalk'
import AWS from 'aws-sdk'
import fs from 'fs-extra'
import mime from 'mime-types'
import readdir from 'recursive-readdir'

const opts: AWS.S3.ClientConfiguration = {}

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

    for (const file of files) {
      const uploadPath = path.normalize(`${s3Path}/${path.relative(inputDir, file)}`)
      console.log(chalk.grey(`uploading ${file} to s3://${bucketName}/${uploadPath}`))
      s3.upload({
        Key: uploadPath,
        Bucket: bucketName,
        Body: fs.createReadStream(file),
        ContentType: mime.lookup(uploadPath),
      }).promise()
    }
  } catch (error) {
    throw new Error(`failed to upload dir to s3`)
  }
}

export default s3
