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
      cpu    = 3000
      memory = 1500
    }

    driver = "raw_exec"

    config {
      command = "/usr/bin/bash"
      args    = [
        "/mnt/tidal/dev/scripts/transcoding.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
        "${NOMAD_META_CMD}",
      ]
    }
  }
}