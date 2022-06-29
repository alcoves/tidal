import path from 'path'
import fs from 'fs-extra'
import createTranscodeTree from '../lib/createTranscodeTree'
import { flow } from '../lib/bullmq'
import { rclone } from '../lib/rclone'
import { ImportAssetJob } from '../types'
import { getMetadata } from '../lib/video'
import { ffmpeg } from '../lib/child_process'

function getFFmpegSplitCommandParts(): string {
  return `-f segment -segment_time 10 -c:v copy -an`
}

async function segmentVideo(src: string, tmpDir: string): Promise<string[]> {
  const segmentationPattern = '%06d.mkv'
  const chunksDir = `${tmpDir}/chunks/source`
  await fs.mkdirp(chunksDir)

  await ffmpeg(`-i ${src} ${getFFmpegSplitCommandParts()} ${chunksDir}/${segmentationPattern}`, {
    cwd: tmpDir,
  })

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
  const { assetId, id, input, output } = job.data

  try {
    const sourceFilepath = `${tmpDir}/source`
    console.info(`downloading ${input} to ${sourceFilepath}`)
    await rclone(`copyto ${input} ${sourceFilepath}`)

    console.info('splitting video into chunks')
    const chunks = await segmentVideo(sourceFilepath, tmpDir)

    console.info('uploading local folder to object storage')
    await rclone(`copy ${tmpDir} ${process.env.TIDAL_RCLONE_REMOTE}/${id}`)

    console.info('getting video metadata')
    const metadata = await getMetadata(sourceFilepath)

    console.info('video input validation')
    // TODO :: Make sure it has some basic information

    console.info('enqueueing video transcode', output)
    const flowJob = await createTranscodeTree({
      output,
      chunks,
      assetId,
      metadata,
      id: job.data.id,
      sourceFilename: path.basename(sourceFilepath),
    })
    await flow.add(flowJob)

    return { metadata }
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`removing ${tmpDir}`)
    await fs.remove(tmpDir)
    await job.updateProgress(100)
  }
}
