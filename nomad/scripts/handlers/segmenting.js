const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-east-1' })

const upload = require('../lib/upload');
const segment = require('../lib/segment');
const download = require('../lib/download')
const getPresets = require('../lib/getPresets')
const extractAudio = require('../lib/extractAudio');

const { exec } = require('child_process');

const segmenting = async (args) => {
  console.log(args);
  const { Bucket, videoId, filename, transcodeQueueUrl } = args;

  if (!Bucket || !videoId || !filename || !transcodeQueueUrl) {
    throw new Error(`Arguments don't look right, ${JSON.stringify(args, null, 2)}`)
  }

  console.log('Downloading source clip');
  const downloadParams = { Bucket, Key: `uploads/${videoId}/${filename}` }
  const videoPath = await download(downloadParams, filename);

  console.log('Exporting audio');
  const { audioPath, ext } = await extractAudio(videoPath)

  console.log('Uploading audio');
  await upload('tidal-bken-dev', `audio/${videoId}/source.${ext}`, audioPath)

  console.log('Segmenting video');
  const segments = await segment(videoPath)

  console.log('Uploading segments');
  await Promise.all(segments.map((segment) => {
    return upload('tidal-bken-dev', `segments/${videoId}/${segment}`, `local/segments/${segment}`)
  }))

  console.log('Getting video presets');
  const presets = await getPresets(videoPath)
  console.log('presets', presets)

  for (const { presetName, ffmpegCmdStr } of presets) {
    const messages = segments.map((segment) => {
      return {
        QueueUrl: transcodeQueueUrl,
        MessageBody: JSON.stringify({
          ffmpegCommand: ffmpegCmdStr,
          inPath: `${Bucket}/segments/${videoId}/${segment}`,
          outPath: `${Bucket}/transcoded-segments/${videoId}/${presetName}/${segment}`,
        })
      }
    })

    await Promise.all(messages.map(m => sqs.sendMessage(m).promise()))

    const nomadCmd = [
      'nomad job dispatch -detach',
      `-meta "bucket=${Bucket}"`,
      `-meta "video_id=${videoId}"`,
      `-meta "preset=${presetName}"`,
      'concatinating'
    ]

    const nomadRes = exec(nomadCmd.join(' '), (error, stdout, stderr) => {
      if (error) throw error
      if (stdout) console.log(stdout)
      if (stderr) console.log(stderr)
    });

    console.log('nomadRes', nomadRes)
  }
  return 'done'
}

module.exports = segmenting