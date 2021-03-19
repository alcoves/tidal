job "ingest" {
  priority    = 90
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
      "webhook_url",
    ]
  }

  group "ingest" {
    task "ingest" {
      driver = "raw_exec"

      restart {
        attempts = 5
        delay    = "10s"
      }

      resources {
        cpu    = 4000
        memory = 4000
      }

      config {
        command = "tidal"
        args    = [
          "ingest",
          "${NOMAD_META_RCLONE_SOURCE}",
          "${NOMAD_META_RCLONE_DEST}",
          "--webhookURL",
          "${NOMAD_META_WEBHOOK_URL}"
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