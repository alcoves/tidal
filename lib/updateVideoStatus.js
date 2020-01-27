const api = require('./api');
const gql = require('graphql-tag');
const logger = require('./logger');

module.exports = async (videoId, status) => {
  if (!status || !videoId)
    throw new Error('videoId and status must be defined');
  logger.info(`updating video with status: ${status}`);

  return api.mutate({
    mutation: gql`mutation {
      updateVideo(id: "${videoId}", input: { status: "${status}" }) {
        status
      }
    }`,
  });
};
