job "concatinating" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
      "aws_access_key_id",
      "aws_secret_access_key"
    ]
  }

  task "concatinating" {
    driver = "raw_exec"

    env {
      AWS_ACCESS_KEY_ID     = "${NOMAD_META_AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY = "${NOMAD_META_AWS_SECRET_ACCESS_KEY}"
      ENDPOINT              = "nyc3.digitaloceanspaces.com"
    }

    config {
      command = "concatinating.sh"
      args    = [
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
    }

    template {
      destination = "local/.s3cfg"
      data = <<EOH
[default]
access_key = {{ env "NOMAD_META_AWS_ACCESS_KEY_ID"}}
secret_key = {{ env "NOMAD_META_aws_secret_access_key"}}
host_base = {{ env "ENDPOINT"}}
host_bucket = %(bucket)s.{{ env "ENDPOINT"}}
EOH
    }
  }
}
