const _ = require('lodash')
const AWS = require('aws-sdk')
const fs = require('fs-extra');

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

const TMP_DIR = fs.mkdtempSync('/tmp/');

(async () => {
  if (!BUCKET ||
    !VIDEO_ID ||
    !FILENAME ||
    !TABLE_NAME ||
    !TRANSCODING_QUEUE_URL) {
    console.error({
      BUCKET,
      VIDEO_ID,
      FILENAME,
      TABLE_NAME,
      TRANSCODING_QUEUE_URL
    });
    throw new Error(`undefined env vars`)
  }

  console.log('Downloading source clip');
  const downloadParams = { Bucket: BUCKET, Key: `uploads/${VIDEO_ID}/${FILENAME}` }
  const videoPath = await download(downloadParams, FILENAME, TMP_DIR);

  console.log('Exporting audio');
  const { audioPath, ext } = await extractAudio(videoPath, TMP_DIR)

  console.log('Uploading audio');
  await upload('tidal-bken-dev', `audio/${VIDEO_ID}/source.${ext}`, audioPath)

  console.log('Segmenting video');
  const segments = await segment(videoPath, TMP_DIR)

  console.log('Uploading segments');
  for (const batch of _.chunk(segments, 20)) {
    await Promise.all(batch.map((segment) => {
      return upload('tidal-bken-dev', `segments/${VIDEO_ID}/source/${segment}`, `${TMP_DIR}/segments/${segment}`)
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

    // Enqueue Concatination request 

    await db.put({
      TableName: TABLE_NAME,
      Item: {
        id: VIDEO_ID,
        preset: presetName,
        status: 'segmented'
      }
    }).promise()
  }

  await fs.remove(TMP_DIR);
  return 'done'
})()