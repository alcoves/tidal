import { flow } from '../config/queues'
import { getPreset } from '../data/getPreset'

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
  sourceFilename,
}: {
  id: string
  output: string
  chunks: string[]
  sourceFilename: string
}) {
  // TODO :: Replace
  const hasAudio = true
  const resolutions = ['x264_1080p', 'x264_720p']

  const tidalRemoteDir = `${process.env.TIDAL_RCLONE_REMOTE}/assets/${id}`
  const chunksPath = `${tidalRemoteDir}/chunks`

  const audioJobs = [
    {
      name: 'aac_128k',
      data: {
        input: `${tidalRemoteDir}/${sourceFilename}`,
        cmd: `-i ${sourceFilename} -vn -c:a aac -b:a 128k aac_128k.mp4`,
        output: `${tidalRemoteDir}/aac_128k.mp4`,
      },
      queueName: 'transcode',
    },
    {
      name: 'opus_128k',
      data: {
        input: `${tidalRemoteDir}/${sourceFilename}`,
        cmd: `-i ${sourceFilename} -vn -c:a libopus -b:a 128k opus_128k.mp4`,
        output: `${tidalRemoteDir}/opus_128k.mp4`,
      },
      queueName: 'transcode',
    },
  ]

  const concatJobs = resolutions.map(resolution => {
    return {
      queueName: 'concat',
      name: resolution,
      data: {
        input: `${chunksPath}/${resolution}`,
        output: `${tidalRemoteDir}/${resolution}.mp4`,
      },
      children: chunks.map(chunk => {
        return {
          queueName: 'transcode',
          name: `${resolution}_${chunk}`,
          data: {
            input: `${chunksPath}/source/${chunk}`,
            cmd: `-i ${chunk} ${getPreset(resolution)} transcoded_${chunk}`,
            output: `${chunksPath}/${resolution}/${chunk}`,
          },
        }
      }),
    }
  })

  return {
    name: 'export',
    queueName: 'export',
    data: {
      output,
      input: tidalRemoteDir,
    },
    children: [
      {
        name: 'package',
        queueName: 'package',
        data: {
          inputs: [
            {
              path: `${tidalRemoteDir}/x264_720p.mp4`,
              cmd: 'in=x264_720p.mp4,stream=video,output="x264_720p/x264_720p.mp4",playlist_name="x264_720p/playlist.m3u8",iframe_playlist_name="x264_720p/iframes.m3u8"',
            },
            {
              path: `${tidalRemoteDir}/x264_1080p.mp4`,
              cmd: 'in=x264_1080p.mp4,stream=video,output="x264_1080p/x264_1080p.mp4",playlist_name="x264_1080p/playlist.m3u8",iframe_playlist_name="x264_1080p/iframes.m3u8"',
            },
            {
              path: `${tidalRemoteDir}/opus_128k.mp4`,
              cmd: 'in=opus_128k.mp4,stream=audio,output="opus_128k/opus_128k.mp4",playlist_name="opus_128k/opus_128k.m3u8",hls_group_id=audio,hls_name="ENGLISH"',
            },
            {
              path: `${tidalRemoteDir}/aac_128k.mp4`,
              cmd: 'in=aac_128k.mp4,stream=audio,output="aac_128k/aac_128k.mp4",playlist_name="aac_128k/aac_128k.m3u8",hls_group_id=audio,hls_name="ENGLISH"',
            },
          ],
          output: `${tidalRemoteDir}/hls`,
        },

        children: [...audioJobs, ...concatJobs],
      },
    ],
  }
}
