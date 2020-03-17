job "thumbnailer" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = ["input", "timecode", "keyid", "secretkey"]
  }

  task "thumbnailer" {
    driver = "raw_exec"

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "${NOMAD_META_INPUT}"
    }

    env {
      "AWS_ACCESS_KEY_ID"     = "${NOMAD_META_KEYID}"
      "AWS_SECRET_ACCESS_KEY" = "${NOMAD_META_SECRETKEY}"
      "ENDPOINT"              = "nyc3.digitaloceanspaces.com"
    }


    config {
      command = "/bin/bash"
      args    = ["local/thumbnailer.sh"]
    }

    config {
      command = "thumbnailer.sh"
      args    = ["${NOMAD_META_TIMECODE}"]
    }

    resources {
      cpu    = 250
      memory = 128
    }

    template {
      destination = "local/s3cfg.ini"
      data = <<EOH
[default]
  access_key = {{ env "AWS_ACCESS_KEY_ID"}}
  secret_key = {{ env "AWS_SECRET_ACCESS_KEY"}}
  host_base = {{ env "ENDPOINT"}}
  host_bucket = %(bucket)s.{{ env "ENDPOINT"}}
EOH
    }

    template {
      destination = "local/thumbnailer.sh"
      data = <<EOH
#!/bin/bash
set -e

TIMECODE=$1
VIDEO_INPUT_PATH=local/file
THUMBNAIL_OUTPUT_PATH=local/thumb.webp

ffmpeg -y -i $VIDEO_INPUT_PATH -vframes 1 -ss $TIMECODE -filter:v scale='480:-1' -quality 70 $THUMBNAIL_OUTPUT_PATH

s3cmd put -c local/s3cfg.ini $THUMBNAIL_OUTPUT_PATH s3://bken-sandbox-dev/thumb.jpg

# Split audio

# Segment video

# Enqueue transcode jobs

# Enqueue concatination jobs
EOH
    }
  }
}
