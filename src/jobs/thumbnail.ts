import path from 'path'
import fs from 'fs-extra'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { ThumbnailJob } from '../types'
import { ffmpeg } from '../lib/child_process'
import { rclone, rcloneExec } from '../lib/rclone'

export async function thumbnailJob(job: ThumbnailJob) {
  console.log('thumbnail job starting...')
  const { assetId, output, width, height, fit } = job.data

  console.info('creating temporary directory')
  const tmpDir = await fs.mkdtemp('/tmp/tidal-thumbnail-')

  try {
    console.info('getting asset url')
    const assetPath = `${process.env['TIDAL_RCLONE_REMOTE']}/assets/${assetId}`
    const assetSourcePath = `${assetPath}/source`
    const rcloneLink = await rcloneExec(`link ${assetSourcePath}`)

    console.info('extracting thumbnail')
    const sourceThumbnail = 'thumbnail.png'
    await ffmpeg(`-i ${rcloneLink} -vframes 1 ${sourceThumbnail}`, { cwd: tmpDir })

    console.info('compressing thumbnail')
    const outputFormat = path.extname(output).replace('.', '')
    const compressedThumbnail = `${uuid()}.${outputFormat}`

    await sharp(`${tmpDir}/${sourceThumbnail}`)
      .resize({ width, height, fit })
      .toFormat(outputFormat, { quality: 80 })
      .toFile(`${tmpDir}/${compressedThumbnail}`)

    console.info('uploading thumbnail to tidal remote')
    await rclone(`copy ${tmpDir}/${compressedThumbnail} ${assetPath}/thumbnails`)

    console.info('uploading thumbnail to user defined output')
    await rclone(`copyto ${tmpDir}/${compressedThumbnail} ${output}`)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`removing ${tmpDir}`)
    await fs.remove(tmpDir)
  }
}
