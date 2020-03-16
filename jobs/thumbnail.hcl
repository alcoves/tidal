job "thumbnailer" {
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = ["input", "timecode", "keyid", "secretkey"]
  }

  task "thumbnailer" {
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
      command = "thumbnailer.sh"
      args    = ["${NOMAD_META_INPUT}", "${NOMAD_META_TIMECODE}"]
    }

    resources {
      cpu    = 250
      memory = 128
    }

    template {
      destination = "local/s3cfg.ini"
      data = <<EOH
[default]
  access_key = {{ env "ACCESS_KEY"}}
  secret_key = {{ env "SECRET_KEY"}}
  host_base = {{ env "ENDPOINT"}}
  host_bucket = "%(bucket)s.{{ env "ENDPOINT"}}"
EOH
    }
  }
}