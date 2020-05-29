const fs = require('fs');
const AWS = require('aws-sdk');
const s3ls = require('./s3ls');

const s3 = new AWS.S3({ region: 'us-east-1' });

function cleanup() {
  try {
    fs.unlinkSync('/tmp/manifest.txt');
  } catch (error) {}
}

module.exports.handler = async function (event) {
  cleanup();

  for (const { body } of event.Records) {
    console.log(body);

    const record = JSON.parse(body);
    console.log(record);

    const inPath = record.in_path;
    const outPath = record.out_path;
    const duration = record.duration;
    const ext = outPath.split('.').pop();
    const [, , Bucket, , , videoId, presetName] = inPath.split('/');

    const signedAudioUrl =
      ext === 'mp4'
        ? await s3.getSignedUrlPromise('getObject', {
            Bucket,
            Key: `audio/${videoId}/source.aac`,
          })
        : await s3.getSignedUrlPromise('getObject', {
            Bucket,
            Key: `audio/${videoId}/source.ogg`,
          });

    console.log({
      ext,
      inPath,
      Bucket,
      videoId,
      outPath,
      duration,
      presetName,
    });

    const segments = await s3ls({
      Bucket,
      Prefix: inPath.split(Bucket)[1].substring(1),
    });
    const links = await Promise.all(
      segments.map(({ Key }) => {
        return s3.getSignedUrlPromise('getObject', { Bucket, Key });
      })
    );

    links.map((l) => fs.appendFileSync('/tmp/manifest.txt', `file '${l}'\n`));

    const ffmpegCmd = [
      '/opt/ffmpeg/ffmpeg -hide_banner -loglevel panic -f concat -safe 0',
      '-protocol_whitelist "file,http,https,tcp,tls"',
      '-i /tmp/manifest.txt',
      '-c copy',
      '-f matroska - |',
      '/opt/ffmpeg/ffmpeg',
      `-i - -i "${signedAudioUrl}"`,
      '-c:v copy',
      `-metadata duration=${duration}`,
      '-movflags frag_keyframe+empty_moov',
      `-f ${ext}`,
    ];

    exec(ffmpegCmd.join(' '), function (error, stdout, stderr) {
      if (error) throw error;
    });
  }

  cleanup();
};
