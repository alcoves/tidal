import express from "express"
import { localAuth } from "../middlewares/auth"
import { upload } from "../controllers/chunks"

const router = express.Router()

router.put("/:assetId/:renditionId/:filename", localAuth, upload)

export default router