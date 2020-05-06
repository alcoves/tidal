const { Bucket } = require('../config/config');

const genManifest = (segments, level = 1, levels = {}) => {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (!levels.hasOwnProperty(level)) {
      levels[level] = {};
    }

    const segSplit = segment.split('/');
    const prefix = `${segSplit[0]}/${segSplit[1]}`;
    const videoId = segSplit[2];
    const presetName = segSplit[3];
    const segNumStr = segSplit[5].split('.mkv')[0];

    const padLen = segNumStr.length;
    const segNum = parseInt(segNumStr);
    const segIsEven = !Boolean(segNum % 2);

    if (segments.length === 1) {
      levels[level][segment] = {
        mode: 'mux',
        combineWith: `s3://${Bucket}/audio/${videoId}/source.ogg`,
        to: `s3://${Bucket}/transcoded/${videoId}/${presetName}.webm`,
      };

      break;
    }

    let to;
    let mode;
    let isParent;
    let combineWith;

    if (segIsEven) {
      // Odd end segments show up here because ffmpeg parts are zero indexed
      if (i + 1 === segments.length) {
        mode = 'passthru';
        const nextSegment = `${level + 1}/${Math.floor(segNum / 2)
          .toString()
          .padStart(padLen, '0')}.mkv`;
        to = `s3://${Bucket}/${prefix}/${videoId}/${presetName}/${nextSegment}`;
      } else {
        const nextSegment = `${level + 1}/${(segNum / 2)
          .toString()
          .padStart(padLen, '0')}.mkv`;
        mode = 'concat';
        isParent = 'true';
        to = `s3://${Bucket}/${prefix}/${videoId}/${presetName}/${nextSegment}`;
        combineWith = `s3://${Bucket}/${prefix}/${videoId}/${presetName}/${level}/${(
          segNum + 1
        )
          .toString()
          .padStart(padLen, '0')}.mkv`;
      }
    } else {
      const nextSegment = `${Math.floor(segNum / 2)
        .toString()
        .padStart(padLen, '0')}.mkv`;
      mode = 'concat';
      isParent = 'false';
      to = `s3://${Bucket}/${prefix}/${videoId}/${presetName}/${
        level + 1
      }/${nextSegment}`;
      combineWith = `s3://${Bucket}/${prefix}/${videoId}/${presetName}/${level}/${(
        segNum - 1
      )
        .toString()
        .padStart(padLen, '0')}.mkv`;
    }

    levels[level][segment] = {
      to,
      mode,
      isParent,
      combineWith,
    };
  }

  if (segments.length > 1) {
    const nextSegments = Object.values(levels[level]).reduce((acc, { to }) => {
      const parts = to.split('s3://')[1].split('/');
      parts.shift();
      const s3KeyName = parts.join('/');
      if (acc.indexOf(s3KeyName) < 0) acc.push(s3KeyName);
      return acc;
    }, []);

    return genManifest(nextSegments, (level += 1), levels);
  }

  return levels;
};

module.exports = (presetName, segments) => {
  const transformedSegments = segments.map(({ Key }) => {
    // source segment = segments/source/test/0000.mkv
    const [, , videoId, segment] = Key.split('/');
    return `segments/transcoded/${videoId}/${presetName}/1/${segment}`;
  });

  return genManifest(transformedSegments);
};
