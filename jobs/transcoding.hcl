job "transcoding" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "cmd",
      "preset",
      "bucket",
      "segment",
      "video_id",
      "aws_access_key_id",
      "github_access_token",
      "aws_secret_access_key"
    ]
  }

  task "transcoding" {
    driver = "docker"

    config {
      command = "transcoding.sh"
      args    = [
        "${NOMAD_META_CMD}",
        "${NOMAD_META_PRESET}",
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_SEGMENT}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_AWS_ACCESS_KEY_ID}",
        "${NOMAD_META_GITHUB_ACCESS_TOKEN}",
        "${NOMAD_META_AWS_SECRET_ACCESS_KEY}"
      ]
    }

    resources {
      cpu    = 2048
      memory = 900
      network {
        mbits = 1000
      }
    }
  }
}
