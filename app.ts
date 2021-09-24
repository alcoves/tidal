import dotenv from "dotenv"
dotenv.config()

import "./lib/jobRunner"
import cors from "cors"
import fs from "fs-extra"
import morgan from "morgan"
import express from "express"
import root from "./routes/root"
import assets from "./routes/assets"
import chunks from "./routes/chunks"
import { favicon } from "./middlewares/favicon"
import mongoose, { ConnectOptions } from "mongoose"

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must be defined!")
if (process.env.MONGODB_TLS_CA) {
  fs.writeFileSync("./db.crt", process.env.MONGODB_TLS_CA)
} else {
  throw new Error("MONGODB_TLS_CA must be defined!")
}
  
mongoose.connect(process.env.MONGODB_URI as string, {
  tls: true,
  tlsCAFile: "./db.crt",
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(morgan("tiny"))
app.use(favicon)

app.use("/", root)
app.use("/assets", assets)
app.use("/chunks", chunks)

export default app