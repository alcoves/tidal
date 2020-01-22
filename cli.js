require('dotenv').config();

const axios = require('axios');
const logger = require('./lib/logger');
const runJob = require('./lib/runJob');
const terminateServer = require('./lib/terminateServer');

const onDeathError = async (error) => {
  try {
    logger.error(error);
    let errJson;

    try {
      errJson = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    } catch (error) {
      errJson = JSON.stringify(error);
    }

    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `\`\`\`json\n${errJson}\`\`\``,
      username: 'Video Processing Error Bot',
    });
  } catch (error) {
    return 'there was an error but we could not handle it';
  }
};

(async () => {
  const args = require('yargs')
    .option('videoId', {
      alias: 'vid',
      type: 'string',
      description: 'The id of the video to process',
      demandOption: true,
    })
    .option('type', {
      alias: 't',
      type: 'string',
      description: 'The preset to use. "all" or "reconvert"',
      demandOption: true,
    }).argv;

  try {
    await runJob(args);
  } catch (error) {
    await onDeathError(error);
  } finally {
    terminateServer(args.videoId);
  }
})();
