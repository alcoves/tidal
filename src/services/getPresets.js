const ffmpeg = require("fluent-ffmpeg");

function x264(framerate, width) {
  if (!framerate || !width) {
    throw new Error("framerate and width must be defined");
  }

  const commands = [
    "-bf 2",
    "-g 30",
    "-crf 24",
    "-coder 1",
    "-c:v libx264",
    "-preset faster",
    "-keyint_min 30",
    "-profile:v high",
    "-pix_fmt yuv420p",
    `-vf fps=fps=${framerate},scale=${width}:-2`,
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

  const { framerate, width } = metadata.streams.reduce(
    (acc, cv) => {
      if (cv.r_frame_rate && cv.codec_type === "video") {
        acc.framerate = cv.r_frame_rate;
      }

      if (cv.width) cv.width > acc.width ? (acc.width = cv.width) : null;
      return acc;
    },
    { framerate: null, width: null }
  );

  if (!width) throw new Error(`width: ${width}`);
  if (!framerate) throw new Error(`framerate: ${framerate}`);

  const parsedFramerate = framerate.split("/")[0] / framerate.split("/")[1];

  const presets = [];
  presets.push({
    ext: "mp4",
    preset: "libx264-480p",
    cmd: x264(parsedFramerate > 30 ? 30 : framerate, 854),
  });

  if (width >= 1280) {
    presets.push({
      ext: "mp4",
      preset: "libx264-720p",
      cmd: x264(framerate, 1280),
    });
  }

  if (width >= 1920) {
    presets.push({
      ext: "mp4",
      preset: "libx264-1080p",
      cmd: x264(framerate, 1920),
    });
  }

  if (width >= 2560) {
    presets.push({
      ext: "mp4",
      preset: "libx264-1440p",
      cmd: x264(framerate, 2360),
    });
  }

  if (width >= 3840) {
    presets.push({
      ext: "mp4",
      preset: "libx264-2160p",
      cmd: x264(framerate, 3840),
    });
  }

  console.log(JSON.stringify({ presets, metadata }));
}

const [, , url] = process.argv;
main(url);
