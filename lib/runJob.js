const fs = require('fs-extra');
const download = require('./download');
const processVideo = require('./processVideo');
const createThumbnail = require('./createThumbnail');
const getVideoMetadata = require('./getVideoMetadata');
const updateVideoStatus = require('./updateVideoStatus');

module.exports = async ({ videoId, type }) => {
  try {
    await updateVideoStatus(videoId, 'processing');
    const { sourceDir, sourcePath } = await download(videoId);
    const metadata = await getVideoMetadata(sourcePath);
    await createThumbnail(sourcePath, videoId);

    const convertParams = {
      sourcePath,
      videoId,
      metadata,
    };

    const { width, height } = metadata.streams.reduce((acc, cv) => {
      if (cv.width) acc.width = cv.width;
      if (cv.height) acc.height = cv.height;
      return acc;
    }, {});

    if (width >= 1280) {
      await processVideo({ ...convertParams, preset: '720p' });
    }

    if (width >= 1920) {
      await processVideo({ ...convertParams, preset: '1080p' });
    }

    if (width >= 2560) {
      await processVideo({ ...convertParams, preset: '1440p' });
    }

    if (width >= 3840) {
      await processVideo({ ...convertParams, preset: '2160p' });
    }

    if (type === 'all') {
      await processVideo({ ...convertParams, preset: 'highQuality' });
    }

    await fs.remove(sourceDir);
    await updateVideoStatus(videoId, 'completed');
  } catch (error) {
    throw error;
  }
};
