
const axios = require('axios');

const TIDAL_TABLE = process.env.TIDAL_TABLE;

function enqueueTranscodingJob({ id, bucket, segment }) {
  // TODO :: Use environment variable once nomad servers are tracked in tf
  const nomadAddr =
    'http://10.0.3.87:4646/v1/job/transcoding/dispatch';

  const { Item: nomad } = await db
    .get({
      TableName: 'config',
      Key: { id: 'NOMAD_TOKEN' },
    })
    .promise();

  const { Item: video } = await db
    .get({
      TableName: TIDAL_TABLE,
      Key: { id },
    })
    .promise();

  await Promise.all(video.versions.map(({ cmd, preset }) => {
    return axios.post(
      nomadAddr,
      {
        Meta: {
          cmd,
          s3_in: `s3://${bucket}/segments/${id}/source/${segment}`,
          s3_out: `s3://${bucket}/segments/${id}/${preset}/${segment}`,
        },
      },
      {
        headers: {
          'X-Nomad-Token': nomad.value,
        },
      }
    );
  }))
}

module.exports = enqueueTranscodingJob