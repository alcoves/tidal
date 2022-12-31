import fs from 'fs-extra'
import path from 'path'
import mime from 'mime-types'

import { ffmpeg } from '../lib/ffmpeg'
import { Endpoint, S3 } from 'aws-sdk'
import { TranscodeJob } from '../types'
import { getMetadata } from '../lib/video'

export async function transcodeHandler(job: TranscodeJob) {
  console.info('starting video job')
  await job.updateProgress(0)
  const tmpDir = await fs.mkdtemp(`/tmp/tidal-${job.name}-${job.id}-`)

  const s3 = new S3({
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    credentials: {
      accessKeyId: job.data.remoteConfig.accessKeyId,
      secretAccessKey: job.data.remoteConfig.secretAccessKey,
    },
    endpoint: new Endpoint(job.data.remoteConfig.endpoint),
  })

  try {
    console.info('probing video file')
    const metadata = await getMetadata(job.data.url)
    await job.update({ metadata, ...job.data })
    await job.updateProgress(5)

    console.info('transcoding video files')
    await Promise.all(
      job.data.transcodes.map(async ({ command, output }) => {
        const outputPath = `${tmpDir}/${path.basename(output.key)}`
        await ffmpeg(`-i ${job.data.url} ${command} ${outputPath}`)

        console.info('uploading file')
        return s3
          .upload({
            Key: output.key,
            Bucket: output.bucket,
            ContentType: mime.lookup(outputPath),
            Body: fs.createReadStream(outputPath),
          })
          .promise()
      })
    )

    console.info('finishing job')
    await job.updateProgress(100)

    return 'done'
  } catch (error) {
    console.error(error)
  } finally {
    await fs.remove(tmpDir)
  }
}
