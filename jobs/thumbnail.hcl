job "thumbnail" {
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

  group "thumbnail" {
    task "thumbnail" {
        restart {
          attempts = 3
          delay    = "10s"
        }
        
        resources {
          cpu    = 500
          memory = 500
        }
        
        driver = "raw_exec"

        config {
          command = "/usr/bin/bash"
          args    = [
            "/mnt/tidal/dev/scripts/thumbnail.sh",
            "${NOMAD_META_S3_IN}",
            "${NOMAD_META_S3_OUT}",
            "${NOMAD_META_CMD}",
          ]
        }
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