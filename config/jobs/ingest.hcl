job "ingest" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]

  // constraint {
  //   operator  = "regexp"
  //   value     = "explorer-"
  //   attribute = "${attr.unique.hostname}"
  // }
  
  parameterized {
    payload       = "optional"
    meta_required = [
      "tidal_dir",
      "nomad_token",
      "rclone_config",
      "rclone_dest_dir",
      "rclone_source_file",
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
          "${NOMAD_META_RCLONE_SOURCE_FILE}",
          "${NOMAD_META_RCLONE_DEST_DIR}",
          "--nomadToken",
          "${NOMAD_META_NOMAD_TOKEN}",
          "--tidalDir",
          "${NOMAD_META_TIDAL_DIR}",
          "--rcloneConfig",
          "${NOMAD_META_RCLONE_CONFIG}",
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

    ephemeral_disk {
      migrate = false
      sticky  = false
      size    = "10000"
    }
  }
}