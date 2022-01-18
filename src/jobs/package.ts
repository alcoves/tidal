import path from 'path'
import s3 from '../config/s3'
import { Job } from 'bullmq'
import { purgeURL } from '../utils/bunny'
import { PackageJobData } from '../types'

async function fetchHlsStreams(bucket: string, prefix: string) {
  const { CommonPrefixes } = await s3
    .listObjectsV2({
      Prefix: prefix,
      Bucket: 'cdn.bken.io',
      Delimiter: 'rendition.m3u8',
    })
    .promise()

  const renditionMains = await Promise.all(
    // eslint-disable-next-line
    // @ts-ignore
    CommonPrefixes?.map(async ({ Prefix = '' }) => {
      const s3Res = await s3
        .getObject({
          Key: Prefix,
          Bucket: bucket,
        })
        .promise()
      const lines = s3Res.Body?.toString().split('\n')
      const folder = path.dirname(Prefix.split(prefix)[1]).substring(1)
      return {
        streamLocation: `${folder}/stream.m3u8`,
        streamEntry: lines?.filter(line => {
          return line.includes('#EXT-X-STREAM-INF')
        }),
      }
    })
  )

  return renditionMains
}

function createMainPlaylist(hlsStreams) {
  let hlsMain = `#EXTM3U
#EXT-X-VERSION:6
`

  for (const hlsStream of hlsStreams) {
    hlsMain += `${hlsStream.streamEntry}\n`
    hlsMain += `${hlsStream.streamLocation}\n`
  }

  return hlsMain
}

export async function packageHls(job: Job) {
  const { output, entityId }: PackageJobData = job.data
  await job.updateProgress(99)
  const hlsStreams = await fetchHlsStreams(output.bucket, `v/${entityId}/hls`)
  const mainPlaylist = createMainPlaylist(hlsStreams)

  await s3
    .upload({
      Body: mainPlaylist,
      Bucket: output.bucket,
      Key: `${output.path}/main.m3u8`,
      ContentType: 'application/vnd.apple.mpegurl',
    })
    .promise()

  await purgeURL(`https://cdn.bken.io/v/${entityId}/*`)
  await job.updateProgress(100)
  return 'done'
}
