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

  group "concatinating" {
    task "concatinating" {
      restart {
        attempts = 2
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 1000
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

    reschedule {
      attempts       = 3
      delay          = "10s"
      max_delay      = "30m"
      unlimited      = false
      delay_function = "exponential"
    }
  }
}