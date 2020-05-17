let params;

if (process.env.NODE_ENV === 'production') {
  params = {
    Bucket: process.env.TIDAL_BUCKET,
    transcodingQueueUrl: process.env.TIDAL_TRANSCODING_QUEUE_URL,
  };
} else {
  params = {
    Bucket: 'tidal-bken-dev',
    transcodingQueueUrl:
      'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev',
  };
}

module.exports = params;
