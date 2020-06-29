job "concatinating" {
  type        = "batch"
  datacenters = ["dc1"]
  priority    = 100

  parameterized {
    payload       = "optional"
    meta_required = [
      "s3_in",
      "s3_out",
    ]
  }

  task "concatinating" {
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
        "/mnt/tidal/dev/scripts/concatinating.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
      ]
    }
  }
}