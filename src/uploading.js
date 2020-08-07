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

const getPresets = require('./lib/getPresets');
const getMetadata = require('./lib/getMetadata');
const dispatchJob = require('./lib/dispatchJob');
const createTidalVideo = require('./lib/createTidalVideo');
const deleteTidalVideo = require('./lib/deleteTidalVideo');

async function main(inPath) {
  try {
    const [, , , , videoId] = inPath.split('/');
    console.log('videoId', videoId);

    console.info('getting metadata');
    const { width, duration, framerate } = await getMetadata(inPath);
    console.info('metadata fetched', { width, duration, framerate });

    console.info('getting presets');
    const presets = getPresets(width, framerate);
    console.log('presets fetched', presets);

    console.log('writing entry to tidal db');
    await deleteTidalVideo(videoId);
    await createTidalVideo({ id: videoId, presets, duration, framerate });

    console.info('dispatching thumbnail job');
    await dispatchJob('thumbnail', {
      s3_in: inPath,
      s3_out: `s3://cdn.bken.io/i/${videoId}/thumbnail.webp`,
      script_path: '/home/brendan/code/bken/tidal/scripts/thumbnail.sh',
      cmd:
        '-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50 -threads 1',
    });

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
