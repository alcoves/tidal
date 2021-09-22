import express from "express"
import { startEncode } from "../controllers/encode"

const router = express.Router()

router.post("/", startEncode)

export default router