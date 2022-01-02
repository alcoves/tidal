import fs from 'fs-extra'
import s3 from '../config/s3'
import mime from 'mime-types'
import { S3 } from 'aws-sdk'
import ffmpeg from 'fluent-ffmpeg'

export async function createThumbnail(
  inputUrl: string,
  uploadParams: S3.PutObjectRequest
): Promise<void> {
  const thumbnailName = uploadParams.Key.split('/').pop() || 'thumbnail.jpg'
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const ffThumbOutPath = `${tmpDir}/${thumbnailName}`
  const thumbParams = [
    '-vf',
    'scale=854:480:force_original_aspect_ratio=increase,crop=854:480',
    '-vframes',
    '1',
    '-q:v',
    '4',
    '-f',
    'image2',
  ]

  return new Promise((resolve, reject) => {
    ffmpeg(inputUrl)
      .outputOptions(thumbParams)
      .output(ffThumbOutPath)
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', function () {
        s3.upload({
          ...uploadParams,
          Body: fs.createReadStream(ffThumbOutPath),
          ContentType: mime.lookup(thumbnailName) || '',
        })
          .promise()
          .then(() => {
            fs.removeSync(tmpDir)
            resolve()
          })
          .catch(() => {
            fs.removeSync(tmpDir)
            console.error('Failed to upload thumbnail')
            reject()
          })
      })
      .run()
  })
}
