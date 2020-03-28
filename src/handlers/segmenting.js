const _ = require('lodash')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-east-1' })
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const upload = require('../lib/upload');
const segment = require('../lib/segment');
const download = require('../lib/download')
const getPresets = require('../lib/getPresets')
const extractAudio = require('../lib/extractAudio');

const { exec } = require('child_process');

const segmenting = async (args) => {
  console.log(args);
  const { Bucket, videoId, filename, transcodeQueueUrl, tableName } = args;

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
  for (const batch of _.chunk(segments, 20)) {
    await Promise.all(batch.map((segment) => {
      return upload('tidal-bken-dev', `segments/${videoId}/source/${segment}`, `local/segments/${segment}`)
    }))
  }

  console.log('Getting video presets');
  const presets = await getPresets(videoPath)
  console.log('presets', presets)

  for (const { presetName, ffmpegCmdStr } of presets) {
    const messages = segments.map((segment) => {
      return {
        QueueUrl: transcodeQueueUrl,
        MessageBody: JSON.stringify({
          ffmpegCommand: ffmpegCmdStr,
          inPath: `${Bucket}/segments/${videoId}/source/${segment}`,
          outPath: `${Bucket}/segments/${videoId}/${presetName}/${segment}`,
        })
      }
    })

    console.log(`number of messages: ${messages.length}`);
    let messagesPublished = 0;

    for (const batch of _.chunk(messages, 100)) {
      await Promise.all(batch.map(m => {
        messagesPublished++
        sqs.sendMessage(m).promise()
      }));
      console.log(`messages published ${messagesPublished}`)
    }

    const nomadCmd = [
      'nomad job dispatch -detach',
      `-meta "bucket=${Bucket}"`,
      `-meta "video_id=${videoId}"`,
      `-meta "preset=${presetName}"`,
      `-meta "eventTopic=${eventTopic}"`,
      'concatinating'
    ]

    exec(nomadCmd.join(' '), (error, stdout, stderr) => {
      if (error) throw error
      if (stdout) console.log(stdout)
      if (stderr) console.log(stderr)
    });

    await db.put({
      TableName: tableName,
      Item: {
        id: videoId,
        preset: preset,
        status: 'segmented'
      }
    }).promise()
  }
  return 'done'
}

module.exports = segmenting