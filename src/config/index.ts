import * as dotenv from "dotenv"
dotenv.config()

const requiredEnvs = [
  "PGHOST",
  "PGUSER",
  "PGPORT",
  "PGDATABASE",
  "PGPASSWORD",
  "API_KEY",
  "WASABI_ENDPOINT",
  "WASABI_ACCESS_KEY_ID",
  "WASABI_SECRET_ACCESS_KEY"
]

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} must be defined`)
  }
})