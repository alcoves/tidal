const fs = require('fs-extra');
const logger = require('./lib/logger');
const tmpDir = require('./lib/mkTmpDir')();

const {
  bucket,
  videoId,
  sourceFileName,
  encodingQueueUrl,
  eventPublishingArn,
} = require('yargs').argv;

if (eventPublishingArn)
  logger.config({ eventPublishingArn, region: 'us-east-1' });

if (!bucket) throw new Error('bucket must be defined');
if (!videoId) throw new Error('videoId must be defined');
if (!sourceFileName) throw new Error('sourceFileName must be defined');
if (!encodingQueueUrl) throw new Error('encodingQueueUrl must be defined');

const download = require('./lib/download');
const getPresets = require('./lib/getPresets');
const concatVideo = require('./lib/concatVideo');
const downloadDir = require('./lib/downloadDir');
const segmentVideo = require('./lib/segmentVideo');
const createManifest = require('./lib/createManifest');
const uploadSegments = require('./lib/uploadSegments');
const uploadFinalVideo = require('./lib/uploadFinalVideo');
const splitSourceAudio = require('./lib/splitSourceAudio');
const waitForTranscoding = require('./lib/waitForTranscoding');
const enqueueTransformRequests = require('./lib/enqueueTransformRequests');

(async () => {
  try {
    const remoteSegmentPath = `${videoId}/segments`;

    // download
    const sourcePath = await download({
      tmpDir,
      bucket,
      videoId,
      sourceFileName,
    });

    // segmentVideo
    const segmentPath = await segmentVideo({
      tmpDir,
      sourcePath,
    });

    // upload segments
    await uploadSegments({
      bucket,
      segmentPath,
      remoteSegmentPath,
    });

    // splitAudioFromSource
    const sourceAudioPath = await splitSourceAudio({ tmpDir, sourcePath });

    // getPresetsFromSource
    const presets = await getPresets({ sourcePath });

    await Promise.all(
      presets.map(async ({ presetName, ffmpegCmdStr }) => {
        const transcodeDestinationPath = `${videoId}/transcoded/${presetName}`;

        // publish transcoding preset to sqs
        await enqueueTransformRequests({
          bucket,
          ffmpegCmdStr,
          encodingQueueUrl,
          remoteSegmentPath,
          transcodeDestinationPath,
        });

        // wait for s3 objects
        await waitForTranscoding({
          bucket,
          presetName,
          remoteSegmentPath,
          transcodeDestinationPath,
        });

        // download transcodedParts
        const transcodedLocalPath = await downloadDir({
          bucket,
          tmpDir,
          presetName,
          transcodeDestinationPath,
        });

        // create manifest
        const manifestPath = await createManifest({ transcodedLocalPath });

        // concat video parts
        const concatenatedVideoPath = await concatVideo({
          presetName,
          manifestPath,
          sourceAudioPath,
          transcodedLocalPath,
        });

        // upload video
        await uploadFinalVideo({
          bucket,
          videoId,
          presetName,
          concatenatedVideoPath,
        });
      })
    );

    console.log(`pipeline complete!, removing tmpdir ${tmpDir}`);
    await fs.remove(tmpDir);
  } catch (error) {
    console.error(error);
    await fs.remove(tmpDir);
  }
})();
