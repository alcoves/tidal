/**
 * This file starts a tidal processing event.
 * The source file is read from the input url.
 *   - Metadata is gathered about the video
 *   - Metadata is written to the tidal database
 *   - The thumbnailing job is dispatched
 *     - Takes input url, creates thumb, uploads to cdn, updates db
 *   - The segmenting job is dispatched
 *     - Presets read from database
 *     - Video is segmented
 *     - For each preset and each segment, dispatch transcoding job with preset command
 *     - Dispatch audio job for the preset
 *     - Transcoding jobs start (audio + video)
 *       - When all expected parts are completed (audio + video), dispatch concat
 */

const shortid = require('shortid');

const getPresets = require('./lib/getPresets');
const getMetadata = require('./lib/getMetadata');
const dispatchJob = require('./lib/dispatchJob');
const createTidalVideo = require('./lib/createTidalVideo');

async function main(inPath) {
  try {
    const videoId = shortid();

    console.info('getting metadata');
    const { width, duration, framerate } = await getMetadata(inPath);

    console.info('getting presets');
    const presets = getPresets(width, framerate);

    await createTidalVideo({ id: videoId, presets, duration, framerate });

    // console.info('writing video to tidal db');
    // const { id } = await createTidalVideo(metadata);

    // console.info('dispatching thumbnail job');
    // await dispatchJob('thumbnailing', {
    //   inPath,
    //   cmd: 'do a thumbnail thing',
    //   outPath: `s3://cdn.bken.io/i/${id}/thumbnail.webp`,
    // });

    // console.info('dispatching segmenting job');
    // await dispatchJob('segmenting', {});
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const inPath = process.argv[2];

if (!inPath) {
  throw new Error('invalid input arguments');
}

main(inPath);
