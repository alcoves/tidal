job "transcode" {
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
      "cmd",
      "rclone_source",
      "rclone_dest",
    ]
  }

  group "tidal" {
    task "transcode" {
      driver = "raw_exec"

      restart {
        attempts = 2
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 3500
      }

      config {
        command = "tidal"
        args    = [
          "transcode",
          "${NOMAD_META_RCLONE_SOURCE}",
          "${NOMAD_META_RCLONE_DEST}",
          "--cmd",
          "${NOMAD_META_CMD}",
        ]
      }
    }

    reschedule {
      attempts       = 1
      delay          = "10s"
      max_delay      = "120s"
      unlimited      = false
      delay_function = "exponential"
    }
  }
}