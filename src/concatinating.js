const concatinating = require('./handlers/concatinating');

const preset = process.argv[2];
const bucket = process.argv[3];
const videoId = process.argv[4];
const tableName = process.argv[5];

(async () => {
  try {
    await concatinating({ preset, bucket, videoId, tableName })
  } catch (error) {
    console.error(error)
    process.exit(1);
  }
})()
