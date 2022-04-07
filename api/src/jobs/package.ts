import path from 'path'
import { getS3Config } from '../config/s3'
import { Job } from 'bullmq'
import { purgeURL } from '../utils/bunny'
import { PackageJobData } from '../types'
import { getSettings } from '../utils/redis'

async function fetchHlsStreams(bucket: string, prefix: string) {
  const s3 = await getS3Config()

  // Adds a trailing slash if needed
  prefix.charAt(prefix.length - 1) === '/' ? null : (prefix += '/')

  // Get HLS folders first
  const renditionFolders = await s3
    .listObjectsV2({
      Prefix: prefix,
      Bucket: bucket,
      Delimiter: '/',
    })
    .promise()

  // eslint-disable-next-line
  // @ts-ignore
  const renditionMains = await renditionFolders.CommonPrefixes?.reduce(
    async (acc: any, cv: any) => {
      const prevAcc = await acc
      const { Prefix = '' } = cv
      const hlsMainKey = `${Prefix}rendition.m3u8`

      const s3Res = await s3
        .getObject({
          Key: hlsMainKey,
          Bucket: bucket,
        })
        .promise()
        .catch()

      if (s3Res) {
        const lines = s3Res.Body?.toString().split('\n')
        const folder = path.basename(Prefix)
        prevAcc.push({
          streamLocation: `${folder}/stream.m3u8`,
          streamEntry: lines?.filter(line => {
            return line.includes('#EXT-X-STREAM-INF')
          }),
        })
      }

      return prevAcc
    },
    Promise.resolve([])
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

export async function createMainManifest(bucket: string, path: string, entityId: string) {
  const s3 = await getS3Config()
  const hlsStreams = await fetchHlsStreams(bucket, path)
  const mainPlaylist = createMainPlaylist(hlsStreams)

  await s3
    .upload({
      Bucket: bucket,
      Body: mainPlaylist,
      Key: `${path}/main.m3u8`,
      ContentType: 'application/vnd.apple.mpegurl',
    })
    .promise()

  const settings = await getSettings()
  await purgeURL(`https://${settings.cdnHostname}/v/${entityId}/*`)
}

export async function packageHls(job: Job) {
  const { output, entityId }: PackageJobData = job.data
  await job.updateProgress(99)
  await createMainManifest(output.bucket, output.path, entityId)
  await job.updateProgress(100)
  return 'done'
}
