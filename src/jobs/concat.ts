import fs from 'fs-extra'
import { ConcatJob } from '../types'
import { rclone } from '../lib/rclone'
import { ffmpeg } from '../lib/child_process'

async function createConcatFile(dir: string): Promise<string> {
  const paths = await fs.readdir(dir)
  let file = ''
  for (const path of paths) {
    file += `file '${dir}/${path}'\n`
  }
  return file
}

export async function concatJob(job: ConcatJob) {
  const tmpDir = await fs.mkdtemp('/tmp/tidal-concat-')

  try {
    console.info('concat job starting...')
    const { input, output } = job.data
    const mkvMuxPath = `${tmpDir}/out.mkv`
    const mp4MuxPath = `${tmpDir}/out.mp4`

    console.info('downloading chunks')
    await rclone(`copy ${input} ${tmpDir}/chunks`)

    console.info('creating concatination file')
    const concatFilePath = `${tmpDir}/file.txt`
    const concatFile = await createConcatFile(`${tmpDir}/chunks`)
    await fs.writeFile(concatFilePath, concatFile)

    console.info('concatinating chunks')
    await ffmpeg(
      `-protocol_whitelist file,http,https,tcp,tls -f concat -safe 0 -i ${concatFilePath} -c copy ${mkvMuxPath}`,
      { cwd: tmpDir }
    )

    console.info('remuxing to mp4')
    await ffmpeg(`-i ${mkvMuxPath} -c copy -movflags +faststart ${mp4MuxPath}`, { cwd: tmpDir })

    console.info('uploading concatinated file to storage')
    await rclone(`copyto ${mp4MuxPath} ${output}`)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await fs.remove(tmpDir)
    await job.updateProgress(100)
  }
}
