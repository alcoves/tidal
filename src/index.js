const fs = require('fs-extra');
const logger = require('./lib/logger');
const tmpDir = require('./lib/mkTmpDir')();

const {
  bucket,
  videoId,
  sourceUrl,
  encodingQueueUrl,
  eventPublishingArn,
} = require('yargs').argv;

if (eventPublishingArn)
  logger.config({ eventPublishingArn, region: 'us-east-1' });

if (!bucket) throw new Error('bucket must be defined');
if (!videoId) throw new Error('videoId must be defined');
if (!sourceUrl) throw new Error('sourceUrl must be defined');
if (!encodingQueueUrl) throw new Error('encodingQueueUrl must be defined');

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
    const sourceFile = sourceUrl;
    const remoteSegmentPath = `${videoId}/segments`;

    // segmentVideo
    // splitAudioFromSource
    // getPresetsFromSource
    const [presets, segmentPath, sourceAudioPath] = await Promise.all([
      getPresets({ sourceFile }),
      segmentVideo({ tmpDir, sourceFile }),
      splitSourceAudio({ tmpDir, sourceFile }),
    ]);

    // upload segments
    await uploadSegments({
      bucket,
      segmentPath,
      remoteSegmentPath,
    });

    await fs.remove(segmentPath);

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
