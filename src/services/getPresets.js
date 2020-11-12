const ffmpeg = require("fluent-ffmpeg");

function getFr(r_frame_rate) {
  const [rate, time] = r_frame_rate.split('/');
  return parseFloat(rate / time).toFixed(3) || parseFloat(r_frame_rate).toFixed(3);
}

function calcMaxBitrate(originalWidth, desiredWidth, originalBitrate) {
  return `${parseInt((desiredWidth / originalWidth) * originalBitrate)}`;
}

function x264({ r_frame_rate, width, desiredWidth, bitrate }) {
  // TODO :: if rotation exists, swap the scale parameters because we've detected a vertical video
  if (!r_frame_rate || !width || !desiredWidth) {
    throw new Error("r_frame_rate and width must be defined");
  }

  // https://trac.ffmpeg.org/wiki/Encode/H.264
  // YouTube like filter eq=brightness=-0.04:saturation=1.04

  const commands = [
    "-bf 2",
    "-crf 22",
    "-coder 1",
    "-c:v libx264",
    "-preset faster",
    "-sc_threshold 0",
    "-profile:v high",
    "-pix_fmt yuv420p",
    "-force_key_frames expr:gte(t,n_forced*2)",
    `-vf fps=fps=${r_frame_rate},scale=${desiredWidth}:-2`,
  ];

  if (bitrate) {
    const maxrate = calcMaxBitrate(width, desiredWidth, bitrate);
    commands.push(`-maxrate ${parseInt(maxrate / 1000)}K -bufsize ${parseInt(maxrate * 2 / 1000)}K`)
  }

  return commands.join(" ");
}

async function main(url) {
  if (!url) throw new Error("bad url");

  const metadata = await new Promise((resolve, reject) => {
    ffmpeg(url).ffprobe(function (err, data) {
      if (!data || !data.streams || !data.streams.length) reject("no streams");
      resolve(data);
    });
  });

  if (
    metadata.streams.filter(({ codec_type }) => codec_type === "video").length >
    1
  ) {
    throw new Error("videos must only contain one video stream");
  }

  const { r_frame_rate, width, bitrate } = metadata.streams.reduce(
    (acc, cv) => {
      if (cv.codec_type === "video") {
        if (cv.bit_rate) acc.bitrate = cv.bit_rate;

        if (cv.r_frame_rate) {
          getFr(cv.r_frame_rate) > 60 ? acc.r_frame_rate = "60/1" : acc.r_frame_rate = cv.r_frame_rate;
        }
      }

      if (cv.width) cv.width > acc.width ? (acc.width = cv.width) : null;
      return acc;
    },
    { r_frame_rate: null, width: null, bitrate: null }
  );

  if (!width) throw new Error(`width: ${width}`);
  if (!r_frame_rate) throw new Error(`r_frame_rate: ${r_frame_rate}`);

  const presets = [];
  presets.push({
    ext: "mp4",
    preset: "360p",
    cmd: x264({r_frame_rate, width, desiredWidth: 640, bitrate}),
  });

  if (width >= 1280) {
    presets.push({
      ext: "mp4",
      preset: "720p",
      cmd: x264({r_frame_rate, width, desiredWidth: 1280, bitrate}),
    });
  }

  if (width >= 1920) {
    presets.push({
      ext: "mp4",
      preset: "1080p",
      cmd: x264({r_frame_rate, width, desiredWidth: 1920, bitrate}),
    });
  }

  if (width >= 2560) {
    presets.push({
      ext: "mp4",
      preset: "1440p",
      cmd: x264({r_frame_rate, width, desiredWidth: 2360, bitrate}),
    });
  }

  if (width >= 3840) {
    presets.push({
      ext: "mp4",
      preset: "2160p",
      cmd: x264({r_frame_rate, width, desiredWidth: 3840, bitrate}),
    });
  }

  console.log(JSON.stringify({ presets, metadata }));
}

const [, , url] = process.argv;
main(url);