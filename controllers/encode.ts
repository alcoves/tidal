import ffmpeg from "fluent-ffmpeg"
import { Request, Response } from "express"


function transcode(input: string) {
  return new Promise((resolve, reject) => {
    const hlsOptions = "-c:v libx264 -crf 30 -pix_fmt yuv420p -preset medium -bf 2 -coder 1 -profile high -x264opts keyint=48:min-keyint=48:no-scenecut -hls_playlist_type vod -hls_time 4 -f hls -method POST"
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
      .on("end", function () {
        resolve("done")
      })
      .run()
  }) 
}

export async function startEncode(req: Request, res: Response) {
  const { input } = req.body
  if (!input) return res.sendStatus(400)
  transcode(input)
  res.sendStatus(202)
}