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
    driver = "raw_exec"

    env {
      "AWS_DEFAULT_REGION"    = "nyc3"
      "AWS_ACCESS_KEY_ID"     = "${NOMAD_META_KEYID}"
      "AWS_SECRET_ACCESS_KEY" = "${NOMAD_META_SECRETKEY}"
    }

    config {
      command = "/root/tidal/scripts/thumbnailer.sh"
      args    = ["${NOMAD_META_INPUT}", "${NOMAD_META_TIMECODE}"]
    }

    resources {
      cpu    = 250
      memory = 128
    }
  }
}