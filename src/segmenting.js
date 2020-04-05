const _ = require('lodash')
const AWS = require('aws-sdk')

const sqs = new AWS.SQS({ region: 'us-east-1' })
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const upload = require('./lib/upload');
const segment = require('./lib/segment');
const download = require('./lib/download')
const getPresets = require('./lib/getPresets')
const extractAudio = require('./lib/extractAudio');

const {
  BUCKET,
  VIDEO_ID,
  FILENAME,
  TABLE_NAME,
  TRANSCODING_QUEUE_URL
} = process.env;

(async () => {
  console.log('Downloading source clip');
  const downloadParams = { Bucket: BUCKET, Key: `uploads/${VIDEO_ID}/${FILENAME}` }
  const videoPath = await download(downloadParams, FILENAME);

  console.log('Exporting audio');
  const { audioPath, ext } = await extractAudio(videoPath)

  console.log('Uploading audio');
  await upload('tidal-bken-dev', `audio/${VIDEO_ID}/source.${ext}`, audioPath)

  console.log('Segmenting video');
  const segments = await segment(videoPath)

  console.log('Uploading segments');
  for (const batch of _.chunk(segments, 20)) {
    await Promise.all(batch.map((segment) => {
      return upload('tidal-bken-dev', `segments/${VIDEO_ID}/source/${segment}`, `${process.env.NOMAD_TASK_DIR}/segments/${segment}`)
    }))
  }

  console.log('Getting video presets');
  const presets = await getPresets(videoPath)
  console.log('presets', presets)

  for (const { presetName, ffmpegCmdStr } of presets) {
    const messages = segments.map((segment) => {
      return {
        QueueUrl: TRANSCODING_QUEUE_URL,
        MessageBody: JSON.stringify({
          ffmpegCommand: ffmpegCmdStr,
          inPath: `${BUCKET}/segments/${VIDEO_ID}/source/${segment}`,
          outPath: `${BUCKET}/segments/${VIDEO_ID}/${presetName}/${segment}`,
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


    // enqueue 

    // const nomadUrl = `http://${NOMAD_IP_host}:4646/v1/job/concatinating_${TIDAL_ENV}/dispatch`
    // await axios.post(nomadUrl, {
    //   Meta: {
    //     BUCKET,
    //     video_id: VIDEO_ID,
    //     preset: presetName,
    //     table_name: TABLE_NAME,
    //     github_access_token: GITHUB_ACCESS_TOKEN,
    //     wasabi_access_key_id: WASABI_ACCESS_KEY_ID,
    //     wasabi_secret_access_key: WASABI_SECRET_ACCESS_KEY,
    //   }
    // }).then((res) => {
    //   console.log(res.data)
    // }).catch((error) => {
    //   console.log(error)
    // })

    await db.put({
      TableName: TABLE_NAME,
      Item: {
        id: VIDEO_ID,
        preset: presetName,
        status: 'segmented'
      }
    }).promise()
  }
  return 'done'
})()