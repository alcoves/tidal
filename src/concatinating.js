
const util = require('util');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const WASABI = require('aws-sdk');
const s3ls = require('./lib/s3ls')
const ffmpeg = require('fluent-ffmpeg');
const _exec = require('child_process').exec;

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const exec = util.promisify(_exec)

const sleep = s => new Promise(r => setTimeout(() => r(), 1000 * s))

module.exports = async ({ bucket, preset, videoId, tableName }) => {
  const WASABI_ENDPOINT = 'https://s3.us-east-2.wasabisys.com'

  WASABI.config.update({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    maxRetries: 5,
    httpOptions: {
      timeout: 5000,
      connectTimeout: 3000,
    },
  });

  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    endpoint: new AWS.Endpoint(WASABI_ENDPOINT),
  });

  const segDir = `local/segments`;
  const audioPath = 'local/source.wav';
  const manifest = 'local/manifest.txt';
  const videoPath = `local/${preset}.mp4`;
  const vidNoAudio = `local/${preset}-an.mkv`;

  const numExpectedS3Query = `segments/${videoId}/source`
  const numTranscodedS3Query = `segments/${videoId}/${preset}`

  console.log(`numExpectedS3Query: ${numExpectedS3Query}`);
  console.log(`numTranscodedS3Query: ${numTranscodedS3Query}`);

  const NUM_EXPECTED_CONFIG = { Bucket: bucket, Prefix: numExpectedS3Query }
  const NUM_TRANSCODED_CONFIG = { Bucket: bucket, Prefix: numTranscodedS3Query }

  let NUM_EXPECTED = (await s3ls(NUM_EXPECTED_CONFIG)).length
  let NUM_TRANSCODED = (await s3ls(NUM_TRANSCODED_CONFIG)).length

  console.log('NUM_EXPECTED', NUM_EXPECTED);
  console.log('NUM_TRANSCODED', NUM_TRANSCODED);

  while (NUM_TRANSCODED < NUM_EXPECTED) {
    await sleep(5)
    NUM_TRANSCODED = (await s3ls(NUM_TRANSCODED_CONFIG)).length
    console.log('NUM_EXPECTED', NUM_EXPECTED);
    console.log('NUM_TRANSCODED', NUM_TRANSCODED);
  }

  await exec(`aws s3 sync s3://${bucket}/segments/${videoId}/${preset} ${segDir}`)
  await exec(`aws s3 cp s3://${bucket}/audio/${videoId}/source.wav ${audioPath}`)

  for (const segment of await fs.readdir(segDir)) {
    await fs.appendFile(manifest, `file './segments/${segment}'\n`)
  }

  await new Promise((resolve, reject) => {
    ffmpeg(manifest)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', resolve)
      .output(vidNoAudio)
      .run();
  })

  await new Promise((resolve, reject) => {
    ffmpeg(vidNoAudio)
      .input(audioPath)
      .outputOptions(['-c:v copy', '-movflags +faststart'])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', resolve)
      .output(videoPath)
      .run();
  })

  await exec(`aws s3 cp ${videoPath} s3://${bucket}/transcoded/${videoId}/${preset}.mp4`)

  const s3Res = await s3.upload({
    Bucket: 'media-bken-dev',
    Key: `videos/${videoId}/source.mp4`
  }).promise()

  await db.update({
    TableName: tableName,
    Key: { id: videoId, preset },
    UpdateExpression: 'set #status = :status, #link = :link',
    ExpressionAttributeNames: {
      '#link': 'link',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':link': s3Res.Location,
      ':status': 'completed'
    },
  }).promise()

  return 'done'
}