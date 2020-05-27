let params;

if (process.env.NODE_ENV === 'production') {
  params = {
    Bucket: process.env.TIDAL_BUCKET,
    TIDAL_TABLE: process.env.TIDAL_TABLE,
    transcodingQueueUrl: process.env.TIDAL_TRANSCODING_QUEUE_URL,
  };
} else {
  params = {
    Bucket: 'tidal-bken-dev',
    TIDAL_TABLE: 'tidal-dev',
    transcodingQueueUrl:
      'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev',
  };
}

console.log('params', params);
module.exports = params;
