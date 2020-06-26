job "concatinating" {
  type        = "batch"
  datacenters = ["dc1"]
  priority    = 1

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
      cpu    = 2000
      memory = 2000
    }

    driver = "raw_exec"

    config {
      command = "/usr/bin/bash"
      args    = [
        "/home/ubuntu/tidal/scripts/concatinating.sh",
        "${NOMAD_META_S3_IN}",
        "${NOMAD_META_S3_OUT}",
      ]
    }
  }
}