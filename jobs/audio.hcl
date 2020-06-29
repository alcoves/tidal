job "audio" {
  type        = "batch"
  datacenters = ["dc1"]
  priority    = 100

  parameterized {
    payload       = "optional"
    meta_required = [
      "cmd",
      "s3_in",
      "s3_out",
    ]
  }

  resources {
    cpu    = 3000
    memory = 1500
  }

  task "transcode" {
    restart {
      attempts = 1
      delay    = "10s"
    }

    driver = "raw_exec"

    config {
      command = "/usr/bin/bash"
      args    = [
        "/mnt/tidal/dev/scripts/audio.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
        "${NOMAD_META_CMD}",
      ]
    }
  }
}