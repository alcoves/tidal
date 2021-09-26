
import ffmpeg from "fluent-ffmpeg"
import { Rendition, RenditionInterface } from "../models/models"

const API_PORT = process.env.PORT || 3200

function transcode(rendition: RenditionInterface) {
  console.log("rendition", rendition)
  return new Promise((resolve, reject) => {
    ffmpeg(rendition.asset.input)
      .outputOptions(rendition.command.split(" "))
      .output(`http://localhost:${API_PORT}/chunks/${rendition.asset._id}/${rendition._id}/stream.m3u8`)
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine)
      })
      .on("progress", async function (progress) {
        console.log("Processing: " + progress.percent + "% done", typeof progress.percent)
        if (progress.percent) {
          await Rendition.findOneAndUpdate({ _id: rendition._id }, { progress: progress.percent})
        }
      })
      .on("error", function (err) {
        console.log("An error occurred: " + err.message)
        reject(err.message)
      })
      .on("end", async function () {
        console.log("ffmpeg command completed")
        await Rendition.findOneAndUpdate({ _id: rendition._id }, { status: "completed" })
        console.log("updated database successfully")
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
      Rendition.findOne({ status: "queued" }).populate("asset").then((rendition) => {
        if (rendition) {
          Rendition.updateOne({ _id: rendition._id, status: "queued" }, {$set: { "status": "running" }}).then(updatedRows => {
            console.log("Updated Rows", updatedRows)
            if (updatedRows.modifiedCount) {
              console.log("Job pulled successfully, encoding...")
              processing = true
              transcode(rendition).then((res) => {
                console.log(res)
              }).catch((error) => {
                console.error(error)
              }).finally(() => {
                console.log("Processing done, going back for more...")
                processing = false
              })
            } else {
              console.log("job aquired elseware, returning for another...")
            }
          }).catch(err=>{
            console.log(err)
          })
        }
      }).catch((error) => {
        console.error(error)
      })
    }
  }, 1000 * 2)
}

console.log(`Tidal Job Runner Status: ${process.env.TIDAL_ENCODE === "true" ? "Enabled" : "Disabled"}`)
if (process.env.TIDAL_ENCODE === "true") jobRunner()