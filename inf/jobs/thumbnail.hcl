job "thumbnail" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]


  parameterized {
    payload       = "optional"
    meta_required = [
      "cmd",
      "s3_in",
      "s3_out"
    ]
  }

  group "thumbnail" {
    driver = "raw_exec"

    task "thumbnail" {
      restart {
        attempts = 3
        delay    = "10s"
      }
      
      resources {
        cpu    = 500
        memory = 500
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
          "${NOMAD_META_CMD}"
        ]
      }
    }
  }

  reschedule {
    attempts       = 5
    delay          = "30s"
    max_delay      = "30m"
    unlimited      = false
    delay_function = "exponential"
  }
}