import path from 'path'
import fs from 'fs-extra'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { ThumbnailJob } from '../types'
import { ffmpeg } from '../lib/child_process'
import { rclone, rcloneExec } from '../lib/rclone'
import { parseTimecodeFromSeconds } from '../lib/video'

export async function thumbnailJob(job: ThumbnailJob) {
  console.log('thumbnail job starting...')
  const { input, output, width, height, fit, time } = job.data

  console.info('creating temporary directory')
  const tmpDir = await fs.mkdtemp('/tmp/tidal-thumbnail-')

  try {
    console.info('getting source url')
    const sourceURL = await rcloneExec(`link ${input}`)

    console.info('extracting thumbnail')
    const sourceThumbnail = 'thumbnail.png'

    const timecode = parseTimecodeFromSeconds(time)
    await ffmpeg(`-i ${sourceURL} -vframes 1 -ss ${timecode} ${sourceThumbnail}`, { cwd: tmpDir })

    console.info('compressing thumbnail')
    const outputFormat = path.extname(output).replace('.', '')
    const compressedThumbnail = `${uuid()}.${outputFormat}`

    await sharp(`${tmpDir}/${sourceThumbnail}`)
      .resize({ width, height, fit })
      .toFormat(outputFormat, { quality: 80 })
      .toFile(`${tmpDir}/${compressedThumbnail}`)

    console.info('uploading thumbnail to user defined output')
    await rclone(`copyto ${tmpDir}/${compressedThumbnail} ${output}`)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(`removing ${tmpDir}`)
    await fs.remove(tmpDir)
  }
}