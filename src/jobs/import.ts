import path from 'path'
import fs from 'fs-extra'
import { ffmpeg } from '../utils/ffmpeg'
import { ImportAssetJob } from '../types'
import { uploadFile, uploadFolder } from '../config/s3'
import { downloadFile } from '../utils/utils'

async function getFFmpegSplitCommandParts(input: string, tmpDir: string) {
  const splitCommand = `-f segment -segment_time 10 -c:v copy -an`
  const chunksDir = `${tmpDir}/chunks`
  await fs.mkdirp(chunksDir)
  return {
    input,
    output: `${chunksDir}/%06d.mkv`,
    commands: splitCommand.split(' '),
  }
}

async function segmentVideo(src: string, tmpDir: string, job: ImportAssetJob) {
  const { output, commands } = await getFFmpegSplitCommandParts(src, tmpDir)
  await ffmpeg({
    input: src,
    output,
    commands,
    // updateFunction: job.updateProgress,
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
    await downloadFile(job.data.input, sourceFilepath)

    console.info('Splitting video into chunks')
    await segmentVideo(sourceFilepath, tmpDir, job)

    console.info('Uploading local folder to object storage')
    await uploadFile(sourceFilepath, {
      Key: `imports/${job.data.id}/${path.basename(sourceFilepath)}`,
      Bucket: process.env.DEFAULT_BUCKET || '',
    })
    await uploadFolder(`${tmpDir}/chunks`, {
      Key: `imports/${job.data.id}/chunks`,
      Bucket: process.env.DEFAULT_BUCKET || '',
    })

    console.info('Creating video record in Redis')
    // Call the same function that the refresh endpoint will use
    // Go to s3 and get some metadata and then write the record to Redis
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`Removing ${tmpDir}`)
    await fs.remove(tmpDir)
  }
}
