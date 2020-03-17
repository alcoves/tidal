job "concatinating" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
      "aws_access_key_id",
      "aws_access_key_secret"
    ]
  }

  task "concatinating" {
    driver = "raw_exec"

    env {
      "AWS_ACCESS_KEY_ID"     = "${NOMAD_META_AWS_ACCESS_KEY_ID}"
      "AWS_SECRET_ACCESS_KEY" = "${NOMAD_META_AWS_ACCESS_KEY_SECRET}"
      "ENDPOINT"              = "nyc3.digitaloceanspaces.com"
    }

    config {
      command = "concatinating.sh"
      args    = [
        "${NOMAD_META_PRESET}",
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_AWS_ACCESS_KEY_ID}",
        "${NOMAD_META_AWS_ACCESS_KEY_SECRET}"
      ]
    }

    resources {
      cpu    = 2048
      memory = 900
    }

    template {
      destination = "local/.s3cfg"
      data = <<EOH
[default]
access_key = {{ env "NOMAD_META_AWS_ACCESS_KEY_ID"}}
secret_key = {{ env "NOMAD_META_AWS_ACCESS_KEY_SECRET"}}
host_base = {{ env "ENDPOINT"}}
host_bucket = %(bucket)s.{{ env "ENDPOINT"}}
EOH
    }
  }
}
