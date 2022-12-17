import path from 'path'
import fs from 'fs-extra'
import envVars from '../config/envVars'

import { gpac } from '../lib/gpac'
import { VideoJob } from '../types'
import { ffmpeg } from '../lib/ffmpeg'
import { getAssetPaths, uploadDir } from '../lib/s3'
import { createThumbnail, getMetadata } from '../lib/video'

function getCommands(tmpDir: string): { command: string; outputFile: string }[] {
  const constrainToAspectFilter =
    "-filter:v scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2"

  return [
    {
      outputFile: `${tmpDir}/x264.mp4`,
      command: [
        '-c:a aac -ac 2 -b:a 128k',
        '-c:v libx264 -crf 25 -preset medium -g 300 -keyint_min 300',
        '-movflags faststart',
        '-filter:v scale=1920:-2:force_original_aspect_ratio=decrease,crop=trunc(iw/2)*2:trunc(ih/2)*2',
      ].join(' '),
    },
    // {
    //   outputFile: `${tmpDir}/av1.mp4`,
    //   command: [
    //     '-c:a libopus -ac 2 -b:a 128k',
    //     '-c:v libsvtav1 -crf 40 -preset 8 -g 300 -keyint_min 300',
    //     '-movflags faststart',
    //   ].join(' '),
    // },
  ]
}

export async function videoHandler(job: VideoJob) {
  console.info('starting video job')
  await job.updateProgress(0)

  const tmpDir = await fs.mkdtemp(`/tmp/tidal-${job.name}-${job.id}-`)
  const assetsDir = `${tmpDir}/packaging`
  await fs.ensureDir(assetsDir)
  const args = getCommands(tmpDir)
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

    console.info('transcoding video files')
    await Promise.all(
      args.map(({ command, outputFile }) => {
        return ffmpeg(`-i ${job.data.url} ${command} ${outputFile}`)
      })
    )

    console.info('transcoding video files')
    await job.updateProgress(75)

    console.info('packaging video file')
    const gpacInputs = args.map(a => `-i ${a.outputFile}`).join(' ')
    await gpac(`${gpacInputs} -o ${assetsDir}/main.m3u8:dual:profile=onDemand`)
    await job.updateProgress(85)

    console.info('uploading hls directory to remote')
    await uploadDir(assetsDir, assetPaths.base, envVars.tidalBucket)
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
