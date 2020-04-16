const segmentation = require('./segmenting');

jest.setTimeout(1000 * 60);

describe('segmentation test', () => {
  test('that is segments video', async () => {
    const res = await segmentation({
      videoId: 'test',
      filename: 'source.mp4',
      Bucket: 'tidal-bken-dev',
      transcodingQueueUrl:
        'https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev',
    });
    expect(res).toEqual('done');
  });
});
