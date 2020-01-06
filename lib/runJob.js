const api = require('./api');
const fs = require('fs-extra');
const download = require('./download');
const processVideo = require('./processVideo');
const getVideoMetadata = require('./getVideoMetadata');
const createThumbnail = require('./createThumbnail');

module.exports = async ({ videoId, type }) => {
  try {
    console.log('downloading source video');
    const { sourceDir, sourcePath } = await download(videoId);
    const metadata = await getVideoMetadata(sourcePath);

    await createThumbnail(sourcePath, videoId);

    const convertParams = {
      sourcePath,
      videoId,
      metadata,
    };

    console.log('metadata', metadata);
    const { width, height } = metadata.streams.reduce((acc, cv) => {
      if (cv.width) acc[width] = cv.width;
      if (cv.height) acc[height] = cv.height;
      return acc;
    }, {});

    console.log('automatically creating additional qualities');
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
      console.log('creating high quality original');
      await processVideo({ ...convertParams, preset: 'highQuality' });
    }

    console.log('removing source dir');
    await fs.remove(sourceDir);

    console.log('patching video record with status');
    await api({
      method: 'patch',
      url: `/videos/${videoId}`,
      data: { status: 'completed' },
    });

    console.log('job complete!');
  } catch (error) {
    throw error;
  }
};
