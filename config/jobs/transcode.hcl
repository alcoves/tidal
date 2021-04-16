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
        attempts = 0
        mode     = "fail"
      }

      resources {
        cpu    = 8000
        memory = 4000
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
      attempts = 0
    }
  }
}