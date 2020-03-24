
const util = require('util');
const fs = require('fs-extra');
const s3ls = require('../lib/s3ls')
const ffmpeg = require('fluent-ffmpeg');
const _exec = require('child_process').exec;

const exec = util.promisify(_exec)

const sleep = s => new Promise(r => setTimeout(() => r(), 1000 * s))

module.exports = async ({ bucket, preset, videoId }) => {
  const segDir = `local/segments`;
  const audioPath = 'local/source.wav';
  const manifest = 'local/manifest.txt';
  const videoPath = `local/${preset}.mp4`;
  const vidNoAudio = `local/${preset}-an.mkv`;

  const NUM_EXPECTED_CONFIG = { Bucket: bucket, Prefix: `segments/${videoId}/` }
  const NUM_TRANSCODED_CONFIG = { Bucket: bucket, Prefix: `transcoded-segments/segments/${videoId}/${preset}/` }

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

  await exec(`aws s3 sync s3://${bucket}/transcoded-segments/${videoId}/${preset} ${segDir}`)
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
      .outputOptions(['-movflags +faststart'])
      .on('progress', console.log)
      .on('error', reject)
      .on('end', resolve)
      .output(videoPath)
      .run();
  })

  await exec(`aws s3 cp ${videoPath} s3://${bucket}/transcoded/${videoId}/${preset}.mp4`)
  return 'done'
}