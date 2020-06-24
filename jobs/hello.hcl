job "hello" {
  type        = "batch"
  datacenters = ["dc1"]

  task "example" {
    driver = "exec"

    config {
      command = "/usr/bin/ffmpeg"
      args    = ["-version"]
    }
  }
}