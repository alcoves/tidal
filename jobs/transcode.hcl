job "transcode" {
  priority    = 20
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
      "video_id", "webhook_url",
      "rclone_destination_uri", "rclone_source_uri"
    ]
  }

  group "tidal" {
    task "transcode" {
      driver = "raw_exec"

      restart {
        attempts = 1
        mode     = "fail"
      }

      resources {
        cpu    = 8000
        memory = 6000
      }

      config {
        command = "tidal"
        args    = [
          "transcode",
          "--videoId",
          "${NOMAD_META_VIDEO_ID}",
          "--webhookUrl",
          "${NOMAD_META_WEBHOOK_URL}",
          "--rcloneDestinationUri",
          "${NOMAD_META_RCLONE_DESTINATION_URI}",
          "--rcloneSourceUri",
          "${NOMAD_META_RCLONE_SOURCE_URI}"
        ]
      }
    }

    reschedule {
      attempts = 0
    }
  }
}