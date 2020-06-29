job "segmenting" {
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

  task "segmenting" {
    restart {
      attempts = 1
      delay    = "10s"
    }

    driver = "raw_exec"

    resources {
      cpu    = 3000
      memory = 1500
    }

    config {
      command = "/usr/bin/bash"
      args    = [
        "/mnt/tidal/dev/scripts/segmenting.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
        "${NOMAD_META_CMD}",
      ]
    }
  }
}