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
  const hasAudio = true

  const sourceName = 'source.mp4'
  const resolutions = ['x264_720p']
  const chunks = ['000000.mkv', '000001.mkv', '000002.mkv']
  const chunksPath = `doco:dev-cdn-bken-io/assets/${id}/chunks`

  const audioJob = {
    name: 'opus_128k',
    data: {
      input: `doco:dev-cdn-bken-io/assets/${id}/${sourceName}`,
      cmd: `-i ${sourceName} -vn -c:a libopus -b:a 128k opus_128k.mp4`,
      output: `doco:dev-cdn-bken-io/assets/${id}/opus_128k.mp4`,
    },
    queueName: 'transcode',
  }

  const concatJobs = resolutions.map(resolution => {
    return {
      queueName: 'concat',
      name: resolution,
      data: {
        input: `${chunksPath}/${resolution}`,
        output: `doco:dev-cdn-bken-io/assets/${id}/${resolution}.mp4`,
      },
      children: chunks.map(chunk => {
        return {
          queueName: 'transcode',
          name: `${resolution}_${chunk}`,
          data: {
            input: `${chunksPath}/source/${chunk}`,
            cmd: `-i ${chunk} -c:v libx264 -preset medium -crf 21 transcoded_${chunk}`,
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
      src: `doco:dev-cdn-bken-io/assets/${id}`,
      dest: `doco:dev-cdn-bken-io/exports/${id}`,
    },
    children: [
      {
        name: 'package',
        queueName: 'package',
        data: {
          inputs: [
            {
              path: `doco:dev-cdn-bken-io/assets/${id}/x264_720p.mp4`,
              cmd: 'in=x264_720p.mp4,stream=video,output="x264_720p/x264_720p.mp4",playlist_name="x264_720p/playlist.m3u8",iframe_playlist_name="x264_720p/iframes.m3u8"',
            },
            {
              path: `doco:dev-cdn-bken-io/assets/${id}/opus_128k.mp4`,
              cmd: 'in=opus_128k.mp4,stream=audio,output="opus_128k/opus_128k.mp4",playlist_name="opus_128k/opus_128k.m3u8",hls_group_id=audio,hls_name="ENGLISH"',
            },
          ],
          output: `doco:dev-cdn-bken-io/assets/${id}/hls`,
        },

        children: [audioJob, ...concatJobs],
      },
    ],
  })

  return flowTree
}
