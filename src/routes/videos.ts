import express from "express"
import transcode from "../lib/transcode"
import thumbnail from "../lib/thumbnail"

const router = express.Router()

router.use(function (req, res, next) {
  if (req.method !== "OPTIONS") {
    if (req.header("x-api-key") !== process.env.TIDAL_API_KEY) {
      return res.sendStatus(401)
    }
  }
  next()
})

router.post("/:id", async (req, res) => {
  const { input } = req.body
  if (!input) return res.sendStatus(400)
  await transcode(input, req.params.id)
  res.sendStatus(200)
})

router.post("/:id/thumbnail", async (req, res) => {
  const { input } = req.body
  const { id } = req.params
  if (!id || !input) return res.sendStatus(400)
  await thumbnail(id, input)
  res.sendStatus(200)
})

export default router