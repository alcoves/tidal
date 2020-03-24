const concatinating = require('./handlers/concatinating');

const preset = process.argv[2];
const bucket = process.argv[3];
const videoId = process.argv[4];

(async () => {
  try {
    await concatinating({ preset, bucket, videoId })
  } catch (error) {
    console.error(error)
    process.exit(1);
  }
})()
