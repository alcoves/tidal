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

const args = require('yargs').argv;

const {
  bucket,
  videoId,
  filename,
  tableName,
  transcodingQueueUrl,
} = args;

const {
  TIDAL_ENV,
  NOMAD_IP_host,
  GITHUB_ACCESS_TOKEN,
  WASABI_ACCESS_KEY_ID,
  WASABI_SECRET_ACCESS_KEY
} = process.env;

(async () => {
  console.log('Downloading source clip');
  const downloadParams = { Bucket: bucket, Key: `uploads/${videoId}/${filename}` }
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
      return upload('tidal-bken-dev', `segments/${videoId}/source/${segment}`, `${process.env.NOMAD_TASK_DIR}/segments/${segment}`)
    }))
  }

  console.log('Getting video presets');
  const presets = await getPresets(videoPath)
  console.log('presets', presets)

  for (const { presetName, ffmpegCmdStr } of presets) {
    const messages = segments.map((segment) => {
      return {
        QueueUrl: transcodingQueueUrl,
        MessageBody: JSON.stringify({
          ffmpegCommand: ffmpegCmdStr,
          inPath: `${bucket}/segments/${videoId}/source/${segment}`,
          outPath: `${bucket}/segments/${videoId}/${presetName}/${segment}`,
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

    const nomadUrl = `http://${NOMAD_IP_host}:4646/v1/job/concatinating_${TIDAL_ENV}/dispatch`
    const res = await axios.post(nomadUrl, {
      Meta: {
        bucket,
        video_id: videoId,
        preset: presetName,
        table_name: tableName,
        github_access_token: GITHUB_ACCESS_TOKEN,
        wasabi_access_key_id: WASABI_ACCESS_KEY_ID,
        transcoding_queue_url: transcodingQueueUrl,
        wasabi_secret_access_key: WASABI_SECRET_ACCESS_KEY,
      }
    })
    console.log(res.data);

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
})()