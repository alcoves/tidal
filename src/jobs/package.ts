import util from 'util'
import fs from 'fs-extra'
import { Job } from 'bullmq'
import { exec } from 'child_process'
import { uploadDir } from '../config/s3'
import { purgeURL } from '../utils/bunny'
import { PackageJobData } from '../types'

const execProm = util.promisify(exec)

export async function packageHls(job: Job) {
  const { tmpDir, output, entityId }: PackageJobData = job.data
  await fs.remove(`${tmpDir}/hls`)

  await job.updateProgress(95)
  const { stdout, stderr } = await execProm(
    `mp4hls ${tmpDir}/*.mp4 -o ${tmpDir}/hls -f --segment-duration 4`,
    { shell: '/bin/bash' }
  )
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)

  await job.updateProgress(99)
  await uploadDir(`${tmpDir}/hls`, output.path)

  // Invalidates CDN path
  await purgeURL(`https://cdn.bken.io/v/${entityId}`)

  await fs.remove(tmpDir)
  await job.updateProgress(100)
  return 'done'
}
