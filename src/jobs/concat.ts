import fs from 'fs-extra'
import { ConcatJob } from '../types'
import { ffmpeg } from '../utils/ffmpeg'
import { amazonS3URI, getSignedURL, s3Readdir, uploadFile } from '../config/s3'
import { spawnFFmpeg } from '../lib/ffmpeg'

function createConcatFile(urls: string[]): string {
  let file = ''
  for (const url of urls) {
    file += `file '${url}'\n`
  }
  return file
}

export async function concatJob(job: ConcatJob) {
  const tmpDir = await fs.mkdtemp('/tmp/tidal-concat-')

  try {
    console.info('Concat job starting...')
    const { input, output } = job.data
    const mkvMuxPath = `${tmpDir}/out.mkv`
    const mp4MuxPath = `${tmpDir}/out.mp4`

    console.info('Getting signed chunk URLS')
    const { Bucket, Key } = amazonS3URI(input)
    const remotePaths = await s3Readdir({ Bucket, Prefix: Key })
    const signedChunkURLS = await Promise.all(
      remotePaths.map(({ Key: _key }) => getSignedURL({ Bucket, Key: _key }))
    )

    console.info('Creating concatination file')
    const concatFilePath = `${tmpDir}/file.txt`
    const concatFile = createConcatFile(signedChunkURLS)
    await fs.writeFile(concatFilePath, concatFile)

    console.info('Concatinating chunks')
    await spawnFFmpeg(
      `-protocol_whitelist file,http,https,tcp,tls -f concat -safe 0 -i ${concatFilePath} -c copy ${mkvMuxPath}`
    )

    console.info('Remuxing to mp4')
    await spawnFFmpeg(`-i ${mkvMuxPath} -c copy -movflags +faststart ${mp4MuxPath}`)

    console.info('Uploading concatinated file to storage')
    await uploadFile(mp4MuxPath, amazonS3URI(output))
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await fs.remove(tmpDir)
    await job.updateProgress(100)
  }
}
