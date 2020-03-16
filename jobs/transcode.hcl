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
      "ACCESS_KEY" = "${NOMAD_META_KEYID}"
      "SECRET_KEY" = "${NOMAD_META_SECRETKEY}"
      "ENDPOINT"   = "nyc3.digitaloceanspaces.com"
    }

    config {
      command = "transcode.sh"
    }

    resources {
      cpu    = 1024
      memory = 1024
    }

    template {
      destination = "local/s3cfg.ini"
      data = <<EOH
      ---
      [default]
        access_key = {{ env "AWS_ACCESS_KEY_ID"}}
        secret_key = {{ env "AWS_SECRET_ACCESS_KEY"}}
        host_base = {{ env "ENDPOINT"}}
        host_bucket = "%(bucket)s.{{ env ENDPOINT}}"
      EOH
    }
  }
}