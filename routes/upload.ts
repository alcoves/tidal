import express from "express"
import { upload } from "../controllers/upload"

const router = express.Router()

router.post("/:filename", upload)

export default router