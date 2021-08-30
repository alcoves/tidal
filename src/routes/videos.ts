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
  const { input, user_id } = req.body
  if (!input || !user_id) return res.sendStatus(400)
  const inputSplit = input.split("/")
  const id = inputSplit[inputSplit.length - 2]
  await transcode(input, id, user_id)
  res.json({ data: await getVideo(id) })
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
  const video = await getVideo(req.params.id)
  console.log("Returning Video", video)
  res.json({ data: video })
})

router.delete("/:id", async (req, res) => {
  console.log("Deleting Video")
  res.sendStatus(200)
  // res.json({ data: await getVideo(req.params.id) })
})

router.post("/:id/thumbnail", async (req, res) => {
  const { input } = req.body
  const { id } = req.params
  if (!id || !input) return res.sendStatus(400)
  await thumbnail(id, input)
  res.json({ data: await getVideo(id) })
})

export default router