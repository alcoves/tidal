import "./config/index"
import yargs from "yargs"
import morgan from "morgan"
import express from "express"
import videos from "./routes/videos"

const app = express()
app.use(morgan("tiny"))

app.use(function (req, res, next) {
  if (req.header("x-api-key") !== process.env.API_KEY) {
    return res.sendStatus(401)
  }
  next()
})

app.get("/", async (req, res) => {
  res.sendStatus(200)
})

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use("/videos", videos)

// CLI
  
yargs.scriptName("tidal")
  .usage("$0 <cmd> [args]")
  .command("api [port]", "starts a tidal api server", (yargs) => {
    yargs.positional("port", {
      type: "string",
      default: "4000",
      describe: "the port to run the server on"
    })
  }, function (argv) {
    app.listen(argv.port, () => {
      console.log(`Example app listening at http://localhost:${argv.port}`)
    })
  })
  .command("transcode [input]", "transcode a video file", (yargs) => {
    yargs.positional("input", {
      type: "string",
      describe: "the input video file"
    })
  }, function (argv) {
    console.log("transcoding video file", argv)
  })
  .help()
  .argv
