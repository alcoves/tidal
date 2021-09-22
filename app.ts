import dotenv from "dotenv"
dotenv.config()

import cors from "cors"
import morgan from "morgan"
import express from "express"
import root from "./routes/root"
import mongoose, { ConnectOptions } from "mongoose"
import { favicon } from "./middlewares/favicon"

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must be defined!")
mongoose.connect(process.env.MONGODB_URI as string, {
  tls: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsCAFile: "./ca-certificate.crt"
} as ConnectOptions)

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan("tiny"))
app.use(favicon)

app.use("/", root)

export default app