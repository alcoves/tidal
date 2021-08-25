import * as dotenv from "dotenv"
dotenv.config()

const requiredEnvs = [
  "PGHOST",
  "PGUSER",
  "PGPORT",
  "PGDATABASE",
  "PGPASSWORD",
  "API_KEY",
]

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} must be defined`)
  }
})