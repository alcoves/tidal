import path from 'path'
import fs from 'fs-extra'
import globals from '../config/globals'

import { gpac } from '../lib/gpac'
import { VideoJob } from '../types'
import { ffmpeg } from '../lib/ffmpeg'
import { getAssetPaths, getAssetUrls, uploadDir } from '../lib/s3'
import { createThumbnail, getMetadata } from '../lib/video'

const cmd = [
  '-c:a libopus -ac 2 -b:a 128k',
  '-c:v libsvtav1 -crf 40 -preset 8 -g 300',
  "-filter:v scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
].join(' ')

export async function videoHandler(job: VideoJob) {
  console.info('starting video job')
  await job.updateProgress(0)

  const tmpDir = await fs.mkdtemp(`/tmp/tidal-${job.name}-${job.id}-`)
  const transcodedOutputPath = `${tmpDir}/output.mp4`
  const assetsDir = `${tmpDir}/packaging`
  await fs.ensureDir(assetsDir)
  const assetPaths = getAssetPaths(job.id as string)

  try {
    console.info('probing video file')
    const metadata = await getMetadata(job.data.url)
    await job.update({ metadata, ...job.data })
    await job.updateProgress(5)

    console.info('getting video thumbnail file')
    const thumbnail = await createThumbnail(job.data.url, tmpDir)
    await fs.move(thumbnail, `${assetsDir}/${path.basename(thumbnail)}`)
    await job.updateProgress(10)

    console.info('transcoding video file')
    await ffmpeg(`-i ${job.data.url} ${cmd} ${transcodedOutputPath}`)
    await job.updateProgress(75)

    console.info('packaging video file')
    await gpac(`-i ${transcodedOutputPath} -o ${assetsDir}/main.m3u8:profile=onDemand`)
    await job.updateProgress(85)

    console.info('uploading hls directory to remote')
    await uploadDir(assetsDir, assetPaths.base, globals.tidalBucket)
    await job.updateProgress(95)

    console.info('finishing job')
    await job.updateProgress(100)

    return 'done'
  } catch (error) {
    console.error(error)
  } finally {
    await fs.remove(tmpDir)
  }
}
