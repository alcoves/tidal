// import path from 'path'
// import { getS3Config } from '../config/s3'
// import { Job } from 'bullmq'
// import { purgeURL } from '../utils/bunny'
// import { PackageJobData } from '../types'
// import { getSettings } from '../utils/redis'

// async function fetchHlsStreams(bucket: string, prefix: string) {
//   const s3 = await getS3Config()

//   // Adds a trailing slash if needed
//   prefix.charAt(prefix.length - 1) === '/' ? null : (prefix += '/')

//   // Get HLS folders first
//   const renditionFolders = await s3
//     .listObjectsV2({
//       Prefix: prefix,
//       Bucket: bucket,
//       Delimiter: '/',
//     })
//     .promise()

//   // eslint-disable-next-line
//   // @ts-ignore
//   const renditionMains = await renditionFolders.CommonPrefixes?.reduce(
//     async (acc: any, cv: any) => {
//       const prevAcc = await acc
//       const { Prefix = '' } = cv
//       const hlsMainKey = `${Prefix}rendition.m3u8`

//       const s3Res = await s3
//         .getObject({
//           Key: hlsMainKey,
//           Bucket: bucket,
//         })
//         .promise()
//         .catch()

//       if (s3Res) {
//         const lines = s3Res.Body?.toString().split('\n')
//         const folder = path.basename(Prefix)
//         prevAcc.push({
//           streamLocation: `${folder}/stream.m3u8`,
//           streamEntry: lines?.filter(line => {
//             return line.includes('#EXT-X-STREAM-INF')
//           }),
//         })
//       }

//       return prevAcc
//     },
//     Promise.resolve([])
//   )
//   return renditionMains
// }

// function createMainPlaylist(hlsStreams) {
//   let hlsMain = `#EXTM3U
// #EXT-X-VERSION:6
// `

//   for (const hlsStream of hlsStreams) {
//     hlsMain += `${hlsStream.streamEntry}\n`
//     hlsMain += `${hlsStream.streamLocation}\n`
//   }

//   return hlsMain
// }

// export async function createMainManifest(bucket: string, path: string, entityId: string) {
//   const s3 = await getS3Config()
//   const hlsStreams = await fetchHlsStreams(bucket, path)
//   const mainPlaylist = createMainPlaylist(hlsStreams)

//   await s3
//     .upload({
//       Bucket: bucket,
//       Body: mainPlaylist,
//       Key: `${path}/main.m3u8`,
//       ContentType: 'application/vnd.apple.mpegurl',
//     })
//     .promise()

//   const settings = await getSettings()
//   if (settings.cdnHostname && settings.bunnyAccessKey) {
//     await purgeURL(`https://${settings.cdnHostname}/v/${entityId}/*`, settings.bunnyAccessKey)
//   }
// }

// export async function packageHls(job: Job) {
//   const { output, entityId }: PackageJobData = job.data
//   await job.updateProgress(99)
//   await createMainManifest(output.bucket, output.path, entityId)
//   await job.updateProgress(100)
//   return 'done'
// }

// packager \
//   in=h264_baseline_360p_600.mp4,stream=audio,output=audio.mp4,playlist_name=audio.m3u8,hls_group_id=audio,hls_name=ENGLISH \
//   in=h264_baseline_360p_600.mp4,stream=video,output=h264_360p.mp4,playlist_name=h264_360p.m3u8,iframe_playlist_name=h264_360p_iframe.m3u8 \
//   in=h264_main_480p_1000.mp4,stream=video,output=h264_480p.mp4,playlist_name=h264_480p.m3u8,iframe_playlist_name=h264_480p_iframe.m3u8 \
//   in=h264_main_720p_3000.mp4,stream=video,output=h264_720p.mp4,playlist_name=h264_720p.m3u8,iframe_playlist_name=h264_720p_iframe.m3u8 \
//   in=h264_high_1080p_6000.mp4,stream=video,output=h264_1080p.mp4,playlist_name=h264_1080p.m3u8,iframe_playlist_name=h264_1080p_iframe.m3u8 \
//   --hls_master_playlist_output h264_master.m3u8 \
//   --mpd_output h264.mpd

// ./packager \
//   in=128k_opus.mp4,stream=audio,output="hls/audio/audio.mp4",playlist_name="hls/audio/audio.m3u8",hls_group_id=audio,hls_name="ENGLISH" \
//   in=240p.mp4,stream=video,output="hls/240p/240p.mp4",playlist_name="hls/240p/playlist.m3u8",iframe_playlist_name="hls/240p/iframes.m3u8" \
//   in=480p.mp4,stream=video,output="hls/480p/480p.mp4",playlist_name="hls/480p/playlist.m3u8",iframe_playlist_name="hls/480p/iframes.m3u8" \
//   in=720p.mp4,stream=video,output="hls/720p/720p.mp4",playlist_name="hls/720p/playlist.m3u8",iframe_playlist_name="hls/720p/iframes.m3u8" \
//   in=1080p.mp4,stream=video,output="hls/1080p/1080p.mp4",playlist_name="hls/1080p/playlist.m3u8",iframe_playlist_name="hls/1080p/iframes.m3u8" \
//   in=1440p.mp4,stream=video,output="hls/1440p/1440p.mp4",playlist_name="hls/1440p/playlist.m3u8",iframe_playlist_name="hls/1440p/iframes.m3u8" \
//   --hls_master_playlist_output "master.m3u8" \
//   --mpd_output "master.mpd"
