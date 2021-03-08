job "thumbnail" {
  priority    = 100
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "optional"
    meta_required = [
      "rclone_source",
      "rclone_dest",
    ]
  }

  group "thumbnail" {
    task "thumbnail" {
      driver = "raw_exec"

      restart {
        attempts = 3
        delay    = "10s"
      }
      
      resources {
        cpu    = 1000
        memory = 1000
      }

      config {
        command = "tidal"
        args    = [
          "thumbnail",
          "${NOMAD_META_RCLONE_SOURCE}",
          "${NOMAD_META_RCLONE_DEST}",
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