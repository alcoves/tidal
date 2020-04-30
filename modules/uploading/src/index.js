const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({ region: 'us-east-1' });

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  for (const { body } of event.Records) {
    const { Records } = JSON.parse(body);
    for (const { s3 } of Records) {
      const bucket = s3.bucket.name;
      const videoId = s3.object.key.split('/')[1];
      const filename = s3.object.key.split('/')[2];

      const segRes = await lambda
        .invokeAsync({
          FunctionName: process.env.SEGMENTER_FN_NAME,
          InvokeArgs: JSON.stringify({ videoId, filename }),
        })
        .promise();

      console.log('segRes', segRes);

      const audioRes = await lambda
        .invokeAsync({
          FunctionName: process.env.AUDIO_EXTRACTOR_FN_NAME,
          InvokeArgs: JSON.stringify({
            ffmpeg_cmd: `-vn -c:a libopus -f opus`,
            out_path: `s3://${bucket}/audio/${videoId}/source.ogg`,
            in_path: `s3://${bucket}/uploads/${videoId}/${filename}`,
          }),
        })
        .promise();

      console.log('audioRes', audioRes);
    }
  }
};
