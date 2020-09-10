job "uploading" {
  priority    = 100
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "optional"
    meta_required = [ "s3_in" ]
  }

  group "uploading" {
    task "uploading" {
      driver = "raw_exec"

      env {
        NOMAD_TOKEN = {{ key "NOMAD_TOKEN" }}
      }

      restart {
        attempts = 5
        delay    = "10s"
      }

      resources {
        cpu    = 1000
        memory = 1000
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/uploading.sh",
          "${NOMAD_META_S3_IN}"
        ]
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
}