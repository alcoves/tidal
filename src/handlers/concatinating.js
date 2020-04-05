const util = require('util');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const WASABI = require('aws-sdk');
const s3ls = require('../lib/s3ls')
const sleep = require('../lib/sleep');
const ffmpeg = require('fluent-ffmpeg');
const _exec = require('child_process').exec;

const exec = util.promisify(_exec)
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

module.exports = async () => {
  const {
    BUCKET,
    PRESET,
    VIDEO_ID,
    TIDAL_ENV,
    TABLE_NAME,
    WASABI_ACCESS_KEY_ID,
    WASABI_SECRET_ACCESS_KEY
  } = process.env;

  const TMP_DIR = fs.mkdtempSync('/tmp/');

  const WasabiBucketName = `${TIDAL_ENV === 'dev' ? 'dev-' : ''}cdn.bken.io`;

  WASABI.config.update({
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
    maxRetries: 5,
    httpOptions: {
      timeout: 5000,
      connectTimeout: 3000,
    },
  });

  const s3Wasabi = new WASABI.S3({
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    endpoint: new WASABI.Endpoint('https://s3.us-east-2.wasabisys.com'),
  });

  const segDir = `${TMP_DIR}/segments`;
  const audioPath = `${TMP_DIR}/source.wav`;
  const manifest = `${TMP_DIR}/manifest.txt`;
  const videoPath = `${TMP_DIR}/${PRESET}.mp4`;
  const vidNoAudio = `${TMP_DIR}/${PRESET}-an.mkv`;

  const numExpectedS3Query = `segments/${VIDEO_ID}/source`
  const numTranscodedS3Query = `segments/${VIDEO_ID}/${PRESET}`

  console.log(`numExpectedS3Query: ${numExpectedS3Query}`);
  console.log(`numTranscodedS3Query: ${numTranscodedS3Query}`);

  const NUM_EXPECTED_CONFIG = { Bucket: BUCKET, Prefix: numExpectedS3Query }
  const NUM_TRANSCODED_CONFIG = { Bucket: BUCKET, Prefix: numTranscodedS3Query }

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

  await exec(`aws s3 sync s3://${BUCKET}/segments/${VIDEO_ID}/${PRESET} ${segDir}`)
  await exec(`aws s3 cp s3://${BUCKET}/audio/${VIDEO_ID}/source.wav ${audioPath}`)

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

  console.log('Uploading to s3');
  await exec(`aws s3 cp ${videoPath} s3://${BUCKET}/transcoded/${VIDEO_ID}/${PRESET}.mp4`)
  const wasabiStorageKey = `v/${VIDEO_ID}/${PRESET}.mp4`;

  console.log('Uploading to wasabi', `https://${WasabiBucketName}/${wasabiStorageKey}`);
  const s3Res = await s3Wasabi.upload({
    Key: wasabiStorageKey,
    ContentType: 'video/mp4',
    Bucket: WasabiBucketName,
    Body: fs.createReadStream(videoPath),
    ContentDisposition: `inline; filename=${VIDEO_ID}-${PRESET}.mp4`,
  }).promise()

  console.log('Updating database', s3Res.Location);
  await db.update({
    TableName: TABLE_NAME,
    Key: { id: VIDEO_ID, preset: PRESET },
    UpdateExpression: 'set #status = :status, #link = :link, #percentCompleted = :percentCompleted',
    ExpressionAttributeNames: {
      '#link': 'link',
      '#status': 'status',
      '#percentCompleted': 'percentCompleted'
    },
    ExpressionAttributeValues: {
      ':status': 'completed',
      ':percentCompleted': 100,
      ':link': `https://${WasabiBucketName}/${wasabiStorageKey}`,
    },
  }).promise()

  await fs.remove(TMP_DIR)
  return 'done'
}