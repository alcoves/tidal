import dotenv from "dotenv"
dotenv.config()

import cors from "cors"
import morgan from "morgan"
import multer from "multer"
import express from "express"
import root from "./routes/root"
import encode from "./routes/encode"
import upload from "./routes/upload"
import { favicon } from "./middlewares/favicon"

const up = multer()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(morgan("tiny"))
app.use(favicon)
// eslint-disable-next-line
// @ts-ignore
app.use(up.array())

app.use("/", root)
app.use("/encode", encode)
app.use("/upload", upload)

export default app