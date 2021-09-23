import express from "express"
import { upload } from "../controllers/chunks"

const router = express.Router()

router.put("/:assetId/:renditionId/:filename", upload)

export default router