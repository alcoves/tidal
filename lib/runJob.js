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

    if (type === 'all') {
      console.log('overwriting source video with high quality video');
      await processVideo({
        ...convertParams,
        preset: 'highQuality',
        overwriteSource: true,
      });
    }

    console.log('automatically creating additional qualities');
    if (metadata.width >= 1280) {
      await processVideo({ ...convertParams, preset: '720p' });
    }

    if (metadata.width >= 1920) {
      await processVideo({ ...convertParams, preset: '1080p' });
    }

    if (metadata.width >= 2560) {
      await processVideo({ ...convertParams, preset: '1440p' });
    }

    if (metadata.width >= 3840) {
      await processVideo({ ...convertParams, preset: '2160p' });
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
