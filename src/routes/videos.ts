import express from "express"
import db from "../db/index"

const router = express.Router()

router.get("/", async (req, res) => {
  const data = await db.query("select * from videos", [])
  res.json({ data: data.rows })
})

router.post("/", async (req, res) => {
  // Go process the video file async
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