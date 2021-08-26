import db from "../db/index"
import express from "express"
import transcode from "../lib/transcode"

const router = express.Router()

router.get("/", async (req, res) => {
  const data = await db.query("select * from videos", [])
  res.json({ data: data.rows })
})

router.post("/", async (req, res) => {
  const { rcloneSourceURI, rcloneDestinationURI } = req.body
  if (!rcloneSourceURI || !rcloneDestinationURI) {
    return res.sendStatus(400)
  }
  await transcode({
    rcloneSourceUri: rcloneSourceURI,
    rcloneDestinationUri: rcloneDestinationURI,
  })
  res.json({
    data: {
      id: "123",
      status: "processing"
    }
  })
})

router.get("/:id", async (req, res) => {
  const data = await db.query("select * from videos where id = $1", [req.params.id])
  res.json({ data: data.rows[0] })
})

export default router