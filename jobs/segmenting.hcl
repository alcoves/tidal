job "segmenting" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "bucket",
      "video_id",
      "filename",
      "aws_access_key_id",
      "aws_access_key_secret"
    ]
  }

  task "segmenting" {
    driver = "raw_exec"

    env {
      "AWS_ACCESS_KEY_ID"     = "${NOMAD_META_AWS_ACCESS_KEY_ID}"
      "AWS_SECRET_ACCESS_KEY" = "${NOMAD_META_AWS_ACCESS_KEY_SECRET}"
      "ENDPOINT"              = "nyc3.digitaloceanspaces.com"
    }

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "s3::https://${NOMAD_META_BUCKET}.nyc3.digitaloceanspaces.com/uploads/${NOMAD_META_VIDEO_ID}/${NOMAD_META_FILENAME}"
      options {
        aws_access_key_id     = "${NOMAD_META_AWS_ACCESS_KEY_ID}"
        aws_access_key_secret = "${NOMAD_META_AWS_ACCESS_KEY_SECRET}"
      }
    }

    config {
      command = "segmenting.sh"
      args    = [
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
