import fs from 'fs-extra'
import mime from 'mime-types'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import s3, { getSignedURL } from '../config/s3'

export async function createThumbnail(job: Job): Promise<void> {
  const thumbnailName = 'thumbnail.jpg'
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const ffThumbOutPath = `${tmpDir}/${thumbnailName}`

  const { input, output } = job.data
  const signedUrl = await getSignedURL({ Bucket: input.bucket, Key: input.key })

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
    ffmpeg(signedUrl)
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
          Bucket: output.bucket,
          Key: 'samples/thumbnail.jpg',
          ContentType: mime.lookup(thumbnailName),
          Body: fs.createReadStream(ffThumbOutPath),
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
