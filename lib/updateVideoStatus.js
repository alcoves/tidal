const api = require('./api');
const logger = require('./logger');

module.exports = async (videoId, status) => {
  if (!status || !videoId)
    throw new Error('videoId and status must be defined');
  logger.info(`updating video with status: ${status}`);
  await api.updateVideo(videoId, { status });
};
