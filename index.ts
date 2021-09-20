import axios from "axios"
import { processJob } from "./lib/processJob"

function getApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://api.bken.io"
  }
  return "http://localhost:3100"
}

function main() {
  try {
    let currentlyProcessing = false
    setInterval(() => {
      if (!currentlyProcessing) {
        axios.get(`${getApiUrl()}/jobs`).then((res) => {
          if (res.data && res.data !== "OK") {
            currentlyProcessing = true
            processJob(res.data).then(() => {
              console.log("JOB SUCCESS")
            }).catch(() => {
              console.log("JOB FAILED")
            }).finally(() => {
              currentlyProcessing = false
            })
          }
        }).catch(err => {
          console.error("There was an error fetching a job", err.message)
        })
      }
    }, 2000)
  } catch(error) {
    console.error(error)
  }
}

main()