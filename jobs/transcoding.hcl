job "transcoding" {
  type        = "batch"
  datacenters = ["dc1"]
  priority    = 1

  parameterized {
    payload       = "optional"
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
      args    = [
        "/home/ubuntu/tidal/scripts/transcode.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
        "${NOMAD_META_CMD}",
      ]
    }

    resources {
      cpu    = 2048
      memory = 2048
    }
  }
}