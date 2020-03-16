job "thumbnailer" {
  type        = "batch"
  datacenters = ["dc1"]

  meta {
    input    = ""
    timecode = "00:00:00"
  }

  parameterized {
    meta_required = ["input", "timecode", "keyid", "secretkey"]
  }

  task "tc" {
    driver = "exec"
    config {
      command = "/bin/bash"
      args    = [
        "export AWS_DEFAULT_REGION=nyc3",
        "export AWS_ACCESS_KEY_ID=${NOMAD_META_KEYID}",
        "export AWS_SECRET_ACCESS_KEY=${NOMAD_META_SECRETKEY}",
        "ffmpeg -i ${NOMAD_META_INPUT} -vframes 1 -ss ${NOMAD_META_TIMECODE} -filter:v scale='720:-1' | aws s3 cp - s3://bken-tidal-dev/test/thumb.jpg",
      ]
    }

    resources {
      cpu    = 250
      memory = 128
    }
  }
}