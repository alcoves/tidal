import express from "express"
import { getRoot } from "../controllers/root"

const router = express.Router()

router.get("/", getRoot)

export default router