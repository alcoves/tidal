import * as dotenv from "dotenv"
dotenv.config()

const requiredEnvs = [
  "TIDAL_API_KEY",
  "WASABI_ENDPOINT",
  "WASABI_ACCESS_KEY_ID",
  "WASABI_SECRET_ACCESS_KEY",
  "WEBHOOK_DELIVERY_ENDPOINT"
]

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} must be defined`)
  }
})