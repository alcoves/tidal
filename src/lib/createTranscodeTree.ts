import path from 'path'
import { FlowJob } from 'bullmq'
import { getAudioPresets, getVideoPresets } from './video'
import { ConcatJobData, Metadata, PackageJobData, PublishJobData, TranscodeJobData } from '../types'

interface PackageJobInput {
  cmd: string
  path: string
}

/**
 * This function generates a transcode tree ready for bullmq to process
 * The tree structure is as follows
 *
 * packaging job (reads job tree and grabs all assets. downloads all. packages all. uploads to cdn)
 * in the future, this job could support uploading the returnValue assets (like a normal 720p video) to CDN
 *  opus 128k encode -> return value is s3 asset location for packager
 *  aac 128k encode  -> return value is s3 asset location for packager
 *  x264_1080p concat  -> return value is s3 asset location for packager
 *   chunk 1 transcode -> return value is s3 asset location for concat (signed URL)
 *   chunk 2 transcode -> return value is s3 asset location for concat (signed URL)
 *  x264_720p concat  -> return value is s3 asset location for packager
 *   chunk 1 transcode -> return value is s3 asset location for concat (signed URL)
 *   chunk 2 transcode -> return value is s3 asset location for concat (signed URL)
 */
export default async function createTranscodeTree({
  id,
  output,
  chunks,
  assetId,
  metadata,
  sourceFilename,
}: {
  id: string
  output: string
  assetId: string
  chunks: string[]
  metadata: Metadata
  sourceFilename: string
}) {
  const audioPresets = getAudioPresets()
  const videoPresets = getVideoPresets(metadata.video[0].width || 0, metadata.video[0].height || 0)

  const transcodeJobs: FlowJob[] = []
  const packageJobInputs: PackageJobInput[] = []

  const tidalRemoteDir = `${process.env.TIDAL_RCLONE_REMOTE}/${id}`
  const chunksPath = `${tidalRemoteDir}/chunks`

  if (metadata?.audio.length) {
    audioPresets.map(({ name, getTranscodeCommand, getPackageCommand }) => {
      const transcodeJobData: TranscodeJobData = {
        assetId,
        input: `${tidalRemoteDir}/${sourceFilename}`,
        output: `${tidalRemoteDir}/${name}.mp4`,
        cmd: getTranscodeCommand({ input: sourceFilename, output: `${name}.mp4` }),
      }

      transcodeJobs.push({
        name,
        queueName: 'transcode',
        data: transcodeJobData,
      })

      packageJobInputs.push({
        path: `${tidalRemoteDir}/${name}.mp4`,
        cmd: getPackageCommand({
          type: 'audio',
          pkgDir: 'streams',
          folderName: name,
          inputFile: `${name}.mp4`,
        }),
      })
    })
  }

  videoPresets.map(({ name, width, getTranscodeCommand, getPackageCommand }) => {
    packageJobInputs.push({
      path: `${tidalRemoteDir}/${name}.mp4`,
      cmd: getPackageCommand({
        type: 'video',
        pkgDir: 'streams',
        folderName: name,
        inputFile: `${name}.mp4`,
      }),
    })

    const concatJobData: ConcatJobData = {
      assetId,
      input: `${chunksPath}/${name}`,
      output: `${tidalRemoteDir}/${name}.mp4`,
    }

    transcodeJobs.push({
      name,
      queueName: 'concat',
      data: concatJobData,
      children: chunks.map(chunk => {
        const transcodeJobData: TranscodeJobData = {
          assetId,
          input: `${chunksPath}/source/${chunk}`,
          output: `${chunksPath}/${name}/${chunk}`,
          cmd: getTranscodeCommand({
            width,
            metadata,
            input: chunk,
            opts: { crf: 23 },
            output: `${path.basename(chunk)}_${name}.mp4`,
          }),
        }

        return {
          queueName: 'transcode',
          data: transcodeJobData,
          name: `${name}_${chunk}`,
        }
      }),
    })
  })

  const publishJobData: PublishJobData = {
    assetId,
    output,
    input: `${tidalRemoteDir}/pkg`, // Only HLS,MPD assets are published
  }

  const packageJobData: PackageJobData = {
    assetId,
    inputs: packageJobInputs,
    output: `${tidalRemoteDir}/pkg`,
  }

  return {
    name: 'publish',
    queueName: 'publish',
    data: publishJobData,
    children: [
      {
        name: 'package',
        queueName: 'package',
        data: packageJobData,
        children: transcodeJobs,
      },
    ],
  }
}
