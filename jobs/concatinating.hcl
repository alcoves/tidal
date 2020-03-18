job "concatinating" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
      "aws_access_key_id",
      "github_access_token",
      "aws_secret_access_key"
    ]
  }

  task "concatinating" {
    driver = "docker"

    config {
      force_pull = true
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:dev"
      command    = "/tidal/scripts/concatinating.sh"

      auth {
        username = "rustyguts"
        password = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      }

      args = [
        "${NOMAD_META_PRESET}",
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_AWS_ACCESS_KEY_ID}",
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
