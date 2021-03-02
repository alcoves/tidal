job "ingest" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "explorer-"
    attribute = "${attr.unique.hostname}"
  }
  
  parameterized {
    payload       = "optional"
    meta_required = [
      "rclone_source_file",
      "rclone_dest_dir",
    ]
  }

  group "ingest" {
    task "ingest" {
      driver = "raw_exec"

      template {
        data = <<EOH
NOMAD_TOKEN="{{key "secrets/NOMAD_TOKEN"}}"
CONSUL_TOKEN="{{key "secrets/CONSUL_TOKEN"}}"
        EOH
        
        destination = ".env"
        env         = true
      }

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
          "${NOMAD_META_RCLONE_DEST_DIR}"
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