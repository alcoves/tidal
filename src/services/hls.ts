// import fs from 'fs-extra'
// import ffmpeg from 'fluent-ffmpeg'
// import { db } from '../config/db'
// import { Video, Rendition } from '@prisma/client'
// import { defaultBucket, getSignedURL, uploadFolder } from '../config/s3'

// const RESOLUTIONS = {
//   240: {
//     name: '240p',
//     width: 352,
//     height: 240,
//     bandwidth: 600,
//   },
//   360: {
//     name: '360p',
//     width: 640,
//     height: 360,
//     bandwidth: 800,
//   },
//   480: {
//     name: '480p',
//     width: 854,
//     height: 480,
//     bandwidth: 1400,
//   },
//   720: {
//     name: '720p',
//     width: 1280,
//     height: 720,
//     bandwidth: 2800,
//   },
//   1080: {
//     name: '1080p',
//     width: 1920,
//     height: 1080,
//     bandwidth: 5000,
//   },
//   1440: {
//     name: '1440p',
//     width: 2560,
//     height: 1440,
//     bandwidth: 8000,
//   },
//   2160: {
//     name: '2160p',
//     width: 3840,
//     height: 2160,
//     bandwidth: 25000,
//   },
// }

// function getVideoFilter(width: number): string {
//   return `-vf scale=${width}:${width}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
// }

// function getX264(bandwidth: number): string {
//   return `-c:v libx264 -crf 24 -maxrate ${bandwidth}k -bufsize ${
//     bandwidth * 2
//   }k -preset faster -force_key_frames expr:gte(t,n_forced*2)`
// }

// export function getRenditions(video: Video): unknown[] {
//   const audioDefaults = '-c:a aac -b:a 128k -ar 44100'
//   const hlsDefaults =
//     '-hls_flags independent_segments -hls_segment_type mpegts -hls_playlist_type vod -hls_time 4'

//   const renditions: unknown[] = [
//     {
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: RESOLUTIONS[240].name,
//       width: RESOLUTIONS[240].width,
//       height: RESOLUTIONS[240].height,
//       bandwidth: RESOLUTIONS[240].bandwidth,
//       command: `${getX264(RESOLUTIONS[240].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         RESOLUTIONS[240].width
//       )} ${hlsDefaults}`,
//     },
//   ]

//   if (video.width >= RESOLUTIONS[360].width) {
//     const rendition = RESOLUTIONS[360]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[360].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   if (video.width >= RESOLUTIONS[480].width) {
//     const rendition = RESOLUTIONS[480]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[480].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   if (video.width >= RESOLUTIONS[720].width) {
//     const rendition = RESOLUTIONS[720]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[720].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   if (video.width >= RESOLUTIONS[1080].width) {
//     const rendition = RESOLUTIONS[1080]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[1080].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   if (video.width >= RESOLUTIONS[1440].width) {
//     const rendition = RESOLUTIONS[1440]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[1440].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   if (video.width >= RESOLUTIONS[2160].width) {
//     const rendition = RESOLUTIONS[2160]
//     renditions.push({
//       codecs: 'mp4a.40.2,avc1.640020',
//       name: rendition.name,
//       width: rendition.width,
//       height: rendition.height,
//       bandwidth: rendition.bandwidth,
//       command: `${getX264(RESOLUTIONS[2160].bandwidth)} ${audioDefaults} ${getVideoFilter(
//         rendition.width
//       )} ${hlsDefaults}`,
//     })
//   }

//   return renditions
// }

// async function transcodeRendition(rendition: Rendition) {
//   const videoId = rendition.videoId as string
//   if (!videoId) return

//   const signedUrl = await getSignedURL({
//     Bucket: defaultBucket,
//     Key: `v/${rendition.videoId}/original`,
//   })
//   const tmpDir = await fs.mkdtemp('/tmp/tidal-')

//   return new Promise((resolve, reject) => {
//     ffmpeg(signedUrl)
//       .outputOptions(rendition.command.split(' '))
//       .output(`${tmpDir}/${rendition.resolution}.m3u8`)
//       .on('start', function (commandLine) {
//         console.log('Spawned Ffmpeg with command: ' + commandLine)
//       })
//       .on('progress', async function (progress) {
//         console.log('Processing: ' + progress.percent + '% done', typeof progress.percent)
//         if (progress.percent) {
//           await db.rendition.update({
//             where: { id: rendition.id },
//             data: { progress: progress.percent },
//           })
//         }
//       })
//       .on('error', async function (err) {
//         console.log('An error occurred: ' + err.message)
//         await db.rendition.update({
//           where: { id: rendition.id },
//           data: { status: 'ERROR' },
//         })
//         // Cleanup
//         await fs.remove(tmpDir)
//         reject(err.message)
//       })
//       .on('end', async function () {
//         console.log('ffmpeg command completed')
//         await db.rendition.update({
//           where: { id: rendition.id },
//           data: { progress: 100, status: 'COMPLETED' },
//         })

//         // Upload to s3
//         await uploadFolder(tmpDir, `v/${videoId}/hls/${rendition.resolution}`)

//         // Create manifest file

//         // Cleanup
//         await fs.remove(tmpDir)
//         resolve('done')
//       })
//       .run()
//   })
// }

// export async function automaticHlsTranscode(videoId: string) {
//   const video = await db.video.findUnique({
//     where: { id: videoId },
//   })
//   if (!video) return

//   const renditions = getRenditions(video)
//   await db.rendition.deleteMany({
//     where: {
//       videoId: video.id,
//     },
//   })
//   await db.rendition.createMany({
//     data: renditions.map((r: any) => {
//       return { command: r.command, resolution: `${r.width}x${r.height}`, videoId }
//     }),
//   })

//   const dbRenditions = await db.rendition.findMany({
//     where: { videoId: video.id },
//   })

//   for (const rendition of dbRenditions) {
//     await transcodeRendition(rendition)
//   }

//   // Then set video status to done
// }
