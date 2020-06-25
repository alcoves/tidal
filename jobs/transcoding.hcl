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
      attempts = 1
      delay    = "10s"
    }

    resources {
      cpu = 4000
    }

    driver = "raw_exec"

    config {
      command = "/usr/bin/bash"
      args    = [
        "/home/ubuntu/tidal/scripts/transcoding.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
        "${NOMAD_META_CMD}",
      ]
    }
  }
}