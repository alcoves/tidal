const ffmpeg = require("fluent-ffmpeg");

function getFr(r_frame_rate) {
  const [rate, time] = r_frame_rate.split('/');
  return parseFloat(rate / time).toFixed(3) || parseFloat(r_frame_rate).toFixed(3);
}

function x264({r_frame_rate, width }) {
  if (!r_frame_rate || !width) {
    throw new Error("r_frame_rate and width must be defined");
  }

  const commands = [
    "-bf 2",
    "-crf 21",
    "-coder 1",
    "-c:v libx264",
    "-preset faster",
    "-profile:v high",
    "-pix_fmt yuv420p",
    `-g ${parseInt(getFr(r_frame_rate) * 2)}`,
    `-vf fps=fps=${r_frame_rate},scale=${width}:-2`,
  ];

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

  const { r_frame_rate, width } = metadata.streams.reduce(
    (acc, cv) => {
      if (cv.r_frame_rate && cv.codec_type === "video") {
        getFr(r_frame_rate) > 60 ? acc.r_frame_rate = "60/1" : acc.r_frame_rate = cv.r_frame_rate;
      }

      if (cv.width) cv.width > acc.width ? (acc.width = cv.width) : null;
      return acc;
    },
    { r_frame_rate: null, width: null }
  );

  if (!width) throw new Error(`width: ${width}`);
  if (!r_frame_rate) throw new Error(`r_frame_rate: ${r_frame_rate}`);

  const presets = [];
  presets.push({
    ext: "mp4",
    preset: "libx264-480p",
    cmd: x264({r_frame_rate, width: 854}),
  });

  if (width >= 1280) {
    presets.push({
      ext: "mp4",
      preset: "libx264-720p",
      cmd: x264({r_frame_rate, width: 1280}),
    });
  }

  if (width >= 1920) {
    presets.push({
      ext: "mp4",
      preset: "libx264-1080p",
      cmd: x264({r_frame_rate, width: 1920}),
    });
  }

  if (width >= 2560) {
    presets.push({
      ext: "mp4",
      preset: "libx264-1440p",
      cmd: x264({r_frame_rate, width: 2360}),
    });
  }

  if (width >= 3840) {
    presets.push({
      ext: "mp4",
      preset: "libx264-2160p",
      cmd: x264({r_frame_rate, width: 3840}),
    });
  }

  console.log(JSON.stringify({ presets, metadata }));
}

const [, , url] = process.argv;
main(url);