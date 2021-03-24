job "thumbnail" {
  priority    = 100
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "="
    value     = "amd64"
    attribute = "${attr.cpu.arch}"
  }

  parameterized {
    payload       = "optional"
    meta_required = [
      "rclone_source",
      "rclone_dest",
    ]
  }

  group "tidal" {
    task "thumbnail" {
      driver = "raw_exec"

      restart {
        attempts = 1
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
    attempts       = 1
    delay          = "30s"
    max_delay      = "30s"
    unlimited      = false
    delay_function = "exponential"
  }
}