const api = require('./api');
const fs = require('fs-extra');
const logger = require('./logger');
const download = require('./download');
const processVideo = require('./processVideo');
const getVideoMetadata = require('./getVideoMetadata');
const createThumbnail = require('./createThumbnail');

module.exports = async ({ videoId, type }) => {
  try {
    logger.info('downloading source video');
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

    logger.info('automatically creating additional qualities');
    if (width >= 1280) {
      await processVideo({ ...convertParams, preset: '720p' });
    }

    // if (width >= 1280 || height >= 1280) {
    //   // generate preset commands
    //   // change preset to fileName
    //   // width > height ? '1280:-2' : '-2:1280'
    //   await processVideo({ ...convertParams, preset: '720p' });
    // }

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
      logger.info('creating high quality original');
      await processVideo({ ...convertParams, preset: 'highQuality' });
    }

    logger.info('removing source dir');
    await fs.remove(sourceDir);

    logger.info('patching video record with status');
    await api({
      method: 'patch',
      url: `/videos/${videoId}`,
      data: { status: 'completed' },
    });

    logger.info('job complete!');
  } catch (error) {
    console.error('it should be caught here!');
    throw error;
  }
};
