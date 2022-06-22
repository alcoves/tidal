import { flow } from '../config/queues'

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
export default async function createTranscodeTree(id: string) {
  const sourceName = 'source.mp4'
  const resolutions = ['x264_720p']
  const chunks = ['000000.mkv', '000001.mkv', '000002.mkv']

  // Can we get the chunk urls here?

  const chunksPath = `s3://dev-cdn-bken-io/imports/${id}/chunks`

  const audioJob = {
    name: 'opus_128k',
    data: {
      input: `s3://dev-cdn-bken-io/imports/${id}/${sourceName}`,
      cmd: '-vn -c:a libopus -b:a 128k opus_128k.mp4',
      output: `s3://dev-cdn-bken-io/imports/${id}/opus_128k.mp4`,
    },
    queueName: 'transcode',
  }

  const concatJobs = resolutions.map(resolution => {
    return {
      queueName: 'concat',
      name: resolution,
      data: {
        input: `${chunksPath}/${resolution}`,
        output: `s3://dev-cdn-bken-io/imports/${id}/${resolution}.mp4`,
      },
      children: chunks.map(chunk => {
        return {
          queueName: 'transcode',
          name: `${resolution}_${chunk}`,
          data: {
            input: `${chunksPath}/source/${chunk}`,
            cmd: `-c:v libx264 -preset medium -crf 21 ${chunk}`,
            output: `${chunksPath}/${resolution}/${chunk}`,
          },
        }
      }),
    }
  })

  const flowTree = await flow.add({
    name: 'export',
    queueName: 'export',
    data: {
      src: `s3://dev-cdn-bken-io/imports/${id}`,
      dest: `s3://dev-cdn-bken-io/exports/${id}`,
    },
    children: [
      {
        name: 'package',
        queueName: 'package',
        data: {
          assets: [
            `s3://dev-cdn-bken-io/imports/${id}/x264_720p.mp4`,
            `s3://dev-cdn-bken-io/imports/${id}/opus_128k.mp4`,
          ],
        },

        children: [audioJob, ...concatJobs],
      },
    ],
  })

  return flowTree
}
