job "uploads" {
  priority    = 1
  type        = "batch"
  datacenters = ["dc1"]

  periodic {
    cron             = "*/1 * * * * *"
    prohibit_overlap = true
  }

  task "uploads" {
    driver = "raw_exec"
    config {
      command = "node"
      args    = ["/home/ubuntu/tidal/nomad/scripts/uploading.js"]
    }
  }
}
