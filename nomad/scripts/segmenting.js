const fs = require('fs-extra');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

const Bucket = process.argv[2];
const videoId = process.argv[3];
const filename = process.argv[4];
const transcodeQueueUrl = process.argv[5];

console.log({
  Bucket,
  videoId,
  filename,
  transcodeQueueUrl
})

// const tmpDir = fs.mkdtempSync('/tmp/');

const downloadObject = (params) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Downloading source clip');
      const filePath = `local/${filename}`
      const file = fs.createWriteStream(filePath);
      s3.getObject(params).createReadStream().on('error', console.error).pipe(file)
      file.on('close', () => {
        console.log('Download complete');
        resolve(filePath)
      });
    } catch (error) {
      reject(error)
    }
  })
}

const exportAudio = (path) => {

}

const segmentVideo = () => {

}

const getVideoMetadata = () => {

}

const uploadSements = () => {

}

const getPresets = () => {

}

const sendMessages = () => {

}

const main = async () => {
  try {
    console.log('Downloading source clip');
    const localFilePath = await downloadObject({ Bucket, Key: `uploads/${videoId}/${filename}` })

    console.log('Exporting audio');
    // ffmpeg -y -i $SOURCE_VIDEO -threads 1 $AUDIO_PATH


  } catch (error) {
    console.error(error);
    process.exit(1)
  } finally {
    await fs.remove(tmpDir)
  }
}

main();