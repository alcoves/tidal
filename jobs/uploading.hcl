job "uploads" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "service"

  task "uploads" {
    driver = "raw_exec"
    config {
      command = "node"
      args    = ["/home/ubuntu/tidal/src/uploading.js"]
    }
  }
}
