import path from 'path'
import fs from 'fs-extra'
import config from '../config/constants'
import { ffmpeg } from '../lib/spawn'
import { rclone } from '../lib/rclone'
import { ImportAssetJob } from '../types'
import createTranscodeTree from '../lib/createTranscodeTree'

function getFFmpegSplitCommandParts(): string[] {
  const splitCommand = `-f segment -segment_time 10 -c:v copy -an`
  return splitCommand.split(' ')
}

async function segmentVideo(src: string, tmpDir: string) {
  const segmentationPattern = '%06d.mkv'
  const chunksDir = `${tmpDir}/chunks/source`
  await fs.mkdirp(chunksDir)
  await ffmpeg({
    input: src,
    commands: getFFmpegSplitCommandParts(),
    output: `${chunksDir}/${segmentationPattern}`,
  })
}

/**
 * The import job performs three major actions
 * 1. Copies the remote or local file to object storage
 * 2. Segments the video into chunks, uploading them to object storage
 * 3. Creates a record of the video in Redis
 */
export async function importJob(job: ImportAssetJob) {
  const tmpDir = await fs.mkdtemp('/tmp/tidal-import-')
  console.info(`Temporary directory created: ${tmpDir}`)

  try {
    const sourceFilepath = `${tmpDir}/source${path.extname(job.data.input)}`
    console.info(`Downloading ${job.data.input} to ${sourceFilepath}`)
    await rclone(`copyurl ${job.data.input} ${sourceFilepath}`)

    console.info('Splitting video into chunks')
    await segmentVideo(sourceFilepath, tmpDir)

    console.info('Uploading local folder to object storage')
    await rclone(
      `copy ${tmpDir} ${config.RCLONE_REMOTE}:${config.DEFAULT_BUCKET}/assets/${job.data.id}`
    )

    // console.info('Creating video record in Redis')
    // Call the same function that the refresh endpoint will use
    // Go to s3 and get some metadata and then write the record to Redis

    console.info('Enqueueing video transcode')
    const transcodeJob = await createTranscodeTree(job.data.id)
    // transcode.add()
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`Removing ${tmpDir}`)
    await job.updateProgress(100)
    await fs.remove(tmpDir)
  }
}
