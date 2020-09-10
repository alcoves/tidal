job "concatinating" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "optional"
    meta_required = [
      "s3_in",
      "s3_out",
    ]
  }

  group "concatinating" {
    task "concatinating" {
      driver = "raw_exec"

      restart {
        attempts = 2
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 1000
      }
    
      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/concatinating.sh",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
        ]
      }
    }

    reschedule {
      attempts       = 5
      delay          = "10s"
      max_delay      = "5m"
      unlimited      = false
      delay_function = "exponential"
    }
  }
}