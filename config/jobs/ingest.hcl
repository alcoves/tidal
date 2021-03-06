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
      "rclone_source_file",
      "rclone_dest_dir",
      "tidal_config_dir",
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
          "--tidalConfigDir",
          "${NOMAD_META_TIDAL_CONFIG_DIR}",
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