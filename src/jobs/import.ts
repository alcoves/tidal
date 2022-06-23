import path from 'path'
import fs from 'fs-extra'
import createTranscodeTree from '../lib/createTranscodeTree'
import { rclone } from '../lib/rclone'
import { flow } from '../config/queues'
import { ImportAssetJob } from '../types'
import { spawnFFmpeg } from '../lib/spawn'

function getFFmpegSplitCommandParts(): string {
  return `-f segment -segment_time 10 -c:v copy -an`
}

async function segmentVideo(src: string, tmpDir: string): Promise<string[]> {
  const segmentationPattern = '%06d.mkv'
  const chunksDir = `${tmpDir}/chunks/source`
  await fs.mkdirp(chunksDir)

  await spawnFFmpeg(
    `-i ${src} ${getFFmpegSplitCommandParts()} ${chunksDir}/${segmentationPattern}`,
    tmpDir
  )

  const chunks = await fs.readdir(chunksDir)
  return chunks
}

/**
 * The import job performs three major actions
 * 1. Copies the remote or local file to object storage
 * 2. Segments the video into chunks, uploading them to object storage
 * 3. Creates a record of the video in Redis
 */
export async function importJob(job: ImportAssetJob) {
  const tmpDir = await fs.mkdtemp('/tmp/tidal-import-')
  console.info(`temporary directory created: ${tmpDir}`)
  const { input, output } = job.data

  try {
    const sourceFilepath = `${tmpDir}/source${path.extname(input)}`
    console.info(`downloading ${input} to ${sourceFilepath}`)
    await rclone(`copyto ${input} ${sourceFilepath}`)

    console.info('splitting video into chunks')
    const chunks = await segmentVideo(sourceFilepath, tmpDir)

    console.info('uploading local folder to object storage')
    await rclone(`copy ${tmpDir} ${process.env.TIDAL_RCLONE_REMOTE}/assets/${job.data.id}`)

    // console.info('Creating video record in Redis')
    // Call the same function that the refresh endpoint will use
    // Go to s3 and get some metadata and then write the record to Redis

    console.info('enqueueing video transcode', output)
    const flowJob = await createTranscodeTree({
      output,
      chunks,
      id: job.data.id,
      sourceFilename: path.basename(sourceFilepath),
    })
    await flow.add(flowJob)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`removing ${tmpDir}`)
    await fs.remove(tmpDir)
    await job.updateProgress(100)
  }
}
