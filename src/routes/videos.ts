import db from "../db/index"
import express from "express"
import transcode from "../lib/transcode"
import thumbnail from "../lib/thumbnail"
import getVideo from "../lib/getVideo"

const router = express.Router()

router.use(function (req, res, next) {
  if (req.method !== "OPTIONS") {
    if (req.header("x-api-key") !== process.env.API_KEY) {
      return res.sendStatus(401)
    }
  }
  next()
})

router.get("/", async (req, res) => {
  const data = await db.query("select * from videos", [])
  res.json({ data: data.rows })
})

router.post("/", async (req, res) => {
  const { input } = req.body
  if (!input) return res.sendStatus(400)
  const video = await transcode(input)
  res.json({ data: "" || await getVideo("") })
})

router.patch("/:id", async (req, res) => {
  const reqKeys = Object.keys(req.body)
  const permittedKeys = [
    "status",
    "title",
    "mpd_link",
    "thumbnail",
    "visibility",
    "percent_completed",
  ]

  let updateKeys = ""
  const updateValues: string[] = []

  permittedKeys.forEach((k, i) => {
    if (reqKeys.includes(k)) {
      updateValues.push(req.body[k])
      updateKeys += `${k} = $${i},`
    }
  })

  if (updateKeys && updateValues.length) {
    await db.query(`update videos set ${updateKeys.slice(0,-1)} where id = '${req.params.id}'`, updateValues)
  }
  res.json({ data: await getVideo(req.params.id) })
})

router.get("/:id", async (req, res) => {
  res.json({ data: await getVideo(req.params.id) })
})

router.delete("/:id", async (req, res) => {
  console.log("Deleting Video")
  res.sendStatus(200)
  // res.json({ data: await getVideo(req.params.id) })
})


router.post("/:id/thumbnails", async (req, res) => {
  const { input } = req.body
  const { id } = req.params
  if (!id || !input) return res.sendStatus(400)
  await thumbnail(id, input)
  res.json({
    data: {
      id,
      status: "completed"
    }
  })
})

export default router