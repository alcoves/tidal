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
  const flowTree = await flow.add({
    name: 'package',
    queueName: 'package',
    data: {
      assets: [
        `s3://dev-cdn-bken-io/imports/${id}/x264_720p.mp4`,
        `s3://dev-cdn-bken-io/imports/${id}/opus_128k.mp4`,
      ],
    },
    children: [
      {
        name: 'concat',
        data: {
          input: `s3://dev-cdn-bken-io/imports/${id}/x264_720p`,
          output: `s3://dev-cdn-bken-io/imports/${id}/x264_720p.mp4`,
        },
        queueName: 'concat',
        children: [
          {
            queueName: 'transcode',
            name: 'x264_720p_chunk_1',
            data: {
              input: `s3://dev-cdn-bken-io/imports/${id}/chunks/source/000000.mkv`,
              cmd: '-c:v libx264 -preset medium -crf 21 000000.mkv',
              output: `s3://dev-cdn-bken-io/imports/${id}/chunks/x264_720p/000000.mkv`,
            },
          },
          {
            queueName: 'transcode',
            name: 'x264_720p_chunk_2',
            data: {
              input: `s3://dev-cdn-bken-io/imports/${id}/chunks/source/000001.mkv`,
              cmd: '-c:v libx264 -preset medium -crf 21 000000.mkv',
              output: `s3://dev-cdn-bken-io/imports/${id}/chunks/x264_720p/000001.mkv`,
            },
          },
        ],
      },
      {
        name: 'opus_128k',
        data: {
          input: `s3://dev-cdn-bken-io/imports/${id}/source.mkv`,
          cmd: '-vn -c:a libopus -b:a 128k opus_128k.mp4',
          output: `s3://dev-cdn-bken-io/imports/${id}/opus_128k.mp4`,
        },
        queueName: 'transcode',
      },
    ],
  })

  return flowTree
}
