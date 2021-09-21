import axios from "axios"
import { processJob } from "./lib/processJob"

function main() {
  try {
    let currentlyProcessing = false
    setInterval(() => {
      if (!currentlyProcessing) {
        axios.get(`${process.env.API_ENDPOINT}/jobs`).then((res) => {
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