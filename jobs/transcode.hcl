job "transcode" {
  type        = "batch"
  datacenters = ["dc1"]

  // meta {
  //   input    = ""
  //   timecode = "00:00:00"
  // }

  parameterized {
    meta_required = ["keyid", "secretkey"]
  }

  task "transcode" {
    driver = "exec"

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "https://bken-sandbox-dev.nyc3.digitaloceanspaces.com/720p.mp4"
    }

    env {
      "AWS_DEFAULT_REGION"    = "nyc3"
      "AWS_ACCESS_KEY_ID"     = "${NOMAD_META_KEYID}"
      "AWS_SECRET_ACCESS_KEY" = "${NOMAD_META_SECRETKEY}"
    }

    config {
      command = "transcode.sh"
    }

    resources {
      cpu    = 250
      memory = 128
    }
  }
}