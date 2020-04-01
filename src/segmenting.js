const _ = require('lodash')
const AWS = require('aws-sdk')
const axios = require('axios');

const sqs = new AWS.SQS({ region: 'us-east-1' })
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const upload = require('./lib/upload');
const segment = require('./lib/segment');
const download = require('./lib/download')
const getPresets = require('./lib/getPresets')
const extractAudio = require('./lib/extractAudio');

const segmenting = async () => {
  const {
    videoId,
    filename,
    tableName,
    bucket: Bucket,
    trainscodingQueueUrl,
  } = require('yargs').argv;

  if (!Bucket || !videoId || !filename || !trainscodingQueueUrl) {
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
        QueueUrl: trainscodingQueueUrl,
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

    const res = await axios.post(`http://${process.env.NOMAD_IP_host}:4646/v1/job/concatinating/dispatch`, {
      Meta: {
        bucket,
        video_id: videoId,
        preset: presetName,
        table_name: tableName,
        github_access_token: githubAccessToken,
        wasabi_access_key_id: wasabiAccessKeyId,
        wasabi_secret_access_key: wasabiSecretAcessKey
      }
    })
    console.log(res.body);

    await db.put({
      TableName: tableName,
      Item: {
        id: videoId,
        preset: presetName,
        status: 'segmented'
      }
    }).promise()
  }
  return 'done'
}

module.exports = segmenting