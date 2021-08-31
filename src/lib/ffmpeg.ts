import _ from "lodash"
import ffmpeg from "fluent-ffmpeg"
import { dispatch, TidalEvent } from "./webhook"

const opusAudio = [
  "-map", "0:a?:0", "-c:a:0", "libopus", "-b:a:0", "128k", "-ar:0", "48000"
]
const aacAudio = [
  "-map", "0:a?:0", "-c:a:1", "aac", "-b:a:1", "128k", "-ar:1", "48000"
]
const dashArgs = [
  "-pix_fmt yuv420p",
  "-force_key_frames expr:gte(t,n_forced*2)",
  "-use_timeline 1", "-use_template 1",
  "-dash_segment_type mp4", "-hls_playlist 1",
  "-seg_duration 4", "-streaming 1",
  "-f dash"
]

export default function Ffmpeg (inPath: string, video_id: string, outPath: string, x264Commands: string[]): Promise<string> {
  // const updateProgress = _.debounce(function (progress: number) {
  //   console.log("here")
  //   dispatch({
  //     event: TidalEvent.video_asset_updated,
  //     data: {
  //       id: video_id,
  //       status: "encoding",
  //       percent_completed: progress
  //     }
  //   })
  // }, 4000)

  function updateProgress(progress: number) {
    dispatch({
      event: TidalEvent.video_asset_updated,
      data: {
        id: video_id,
        status: "encoding",
        percent_completed: progress
      }
    })
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .outputOptions(x264Commands)

      .outputOptions(opusAudio)
      .outputOptions(aacAudio)

      .outputOptions(dashArgs)
      // This is a hack because adaptation sets don't work in arrays
      // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/1036
      .outputOption("-adaptation_sets", "id=0,streams=v id=1,streams=a")

      .output(`${outPath}/manifest.mpd`)
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine)
      })
      .on("progress", async function (progress) {
        console.log("Processing: " + progress.percent + "% done")
        updateProgress(progress.percent)
      })
      .on("error", function (err) {
        console.log("An error occurred: " + err.message)
        reject(err.message)
      })
      .on("end", function (stdout, stderr) {
        console.log("Transcoding succeeded !")
        resolve("done")
      })
      // This is noisy
      // .on('stderr', function (stderrLine) {
      // console.log('Stderr output: ' + stderrLine)
      // })
      .run()
  })
}

export function ffThumb (inPath: string, outPath: string, thumbParams: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .outputOptions(thumbParams)
      .output(`${outPath}/thumb.webp`)
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine)
      })
      .on("progress", function (progress) {
        console.log("Processing: " + progress.percent + "% done")
      })
      .on("error", function (err) {
        console.log("An error occurred: " + err.message)
        reject(err.message)
      })
      .on("end", function (stdout, stderr) {
        console.log("Transcoding succeeded !")
        resolve("done")
      })
      // This is noisy
      // .on('stderr', function (stderrLine) {
      // console.log('Stderr output: ' + stderrLine)
      // })
      .run()
  })
}
