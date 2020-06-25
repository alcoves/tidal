job "transcoding" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "required"
    meta_required = [
      "cmd",
      "s3_in",
      "s3_out",
    ]
  }

  task "transcode" {
    restart {
      attempts = 3
      delay    = "10s"
    }

    driver = "raw_exec"

    config {
      command = "/usr/bin/bash"
      args    = ["/home/ubuntu/tidal/scripts/transcode.sh", "s3_in", "s3_out", "cmd"]
    }
  }
}