
import ffmpeg from "fluent-ffmpeg"

function transcode(input: string) {
  return new Promise((resolve, reject) => {
    const hlsOptions = "-c:v libx264 -crf 30 -hls_playlist_type event -hls_time 4 -method PUT"
    ffmpeg(input)
      .outputOptions(hlsOptions.split(" "))
      .output("http://localhost:3200/upload/stream.m3u8")
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine)
      })
      .on("error", function (err) {
        console.log("An error occurred: " + err.message)
        reject(err.message)
      })
      .on("end", async function () {
        resolve("done")
      })
      .run()
  }) 
}

let processing = false

async function jobRunner() {
  setInterval(() => {
    if (!processing) {
      console.info("Pooling for jobs...", `Processing: ${processing}`)
      processing = true
    }
  }, 1000 * 10)
}

if (process.env.TIDAL_ENCODE) jobRunner()