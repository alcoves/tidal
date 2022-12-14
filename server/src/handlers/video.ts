import fs from 'fs-extra'

import { gpac } from '../lib/gpac'
import { VideoJob } from '../types'
import { uploadDir } from '../lib/s3'
import { ffmpeg } from '../lib/ffmpeg'
import { getMetadata } from '../lib/video'

const cmd = [
  '-c:a libopus -ac 2 -b:a 128k',
  '-c:v libsvtav1 -crf 40 -preset 8 -g 300',
  "-filter:v scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
].join(' ')

export async function videoHandler(job: VideoJob) {
  console.info('starting video job')
  const tmpDir = await fs.mkdtemp(`/tmp/tidal-${job.name}-`)
  const transcodedOutputPath = `${tmpDir}/output.mp4`
  const packagingDir = `${tmpDir}/packaging`
  await fs.ensureDir(packagingDir)

  try {
    console.info('probing video file')
    const metadata = await getMetadata(job.data.url)

    console.info('transcoding video file')
    await ffmpeg(`-i ${job.data.url} ${cmd} ${transcodedOutputPath}`)

    console.info('packaging video file')
    await gpac(`-i ${transcodedOutputPath} -o ${packagingDir}/main.m3u8:profile=onDemand`)

    console.info('uploading video file')

    console.info('uploading hls directory to remote')
    await uploadDir(packagingDir, 'test', 'tidal')

    console.info('finishing job')
    await job.updateProgress(100)
  } catch (error) {
    console.error(error)
  } finally {
    await fs.remove(tmpDir)
  }
}
