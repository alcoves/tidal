job "segmenting" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "bucket",
      "video_id",
      "filename",
      "aws_access_key_id",
      "github_access_token",
      "aws_access_key_secret"
    ]
  }

  task "segmenting" {
    driver = "docker"

    config {
      force_pull = true
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:dev"
      command    = "/tidal/scripts/segmenting.sh"

      auth {
        username = "rustyguts"
        password = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      }

      args = [
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_FILENAME}",
        "${NOMAD_META_AWS_ACCESS_KEY_ID}",
        "${NOMAD_META_AWS_ACCESS_KEY_SECRET}"
      ]
    }

    resources {
      cpu    = 2048
      memory = 900
    }
  }
}
