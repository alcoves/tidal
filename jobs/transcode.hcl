job "transcode" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = ["input", "keyid", "secretkey"]
  }

  task "transcode" {
    driver = "exec"

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "${NOMAD_META_INPUT}"
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
      cpu    = 1024
      memory = 1024
    }
  }
}