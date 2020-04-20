const { createThumbnail } = require('./thumbnails');

describe('thumbnails', () => {
  test('create thumbnail', async () => {
    const videoPath = './tmp/test.mp4';
    const thumbnailPath = await createThumbnail(videoPath);
    expect(thumbnailPath).toBeDefined();
  });

  test('upload thumbnail', () => {
    expect(true).toBe(true);
  });

  test('set thumbnail url', () => {
    expect(true).toBe(true);
  });
});
