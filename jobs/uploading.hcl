job "uploads_dev" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "github_access_token",
      "wasabi_access_key_id",
      "wasabi_secret_access_key"
    ]
  }

  task "uploads" {
    driver = "docker"

    env {
      GITHUB_ACCESS_TOKEN      = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      WASABI_ACCESS_KEY_ID     = "${NOMAD_META_WASABI_ACCESS_KEY_ID}"
      WASABI_SECRET_ACCESS_KEY = "${NOMAD_META_WASABI_SECRET_ACCESS_KEY}"
    }

    config {
      force_pull = true
      command    = "node"
      args       = ["/root/tidal/src/uploading.js"]
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:dev"

      auth {
        username = "rustyguts"
        password = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      }
    }

    resources {
      cpu    = 100
      memory = 128
      network {
        port "host" {}
      }
    }
  }
}

job "uploads_prod" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "github_access_token",
      "wasabi_access_key_id",
      "wasabi_secret_access_key"
    ]
  }

  task "uploads" {
    driver = "docker"

    env {
      GITHUB_ACCESS_TOKEN      = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      WASABI_ACCESS_KEY_ID     = "${NOMAD_META_WASABI_ACCESS_KEY_ID}"
      WASABI_SECRET_ACCESS_KEY = "${NOMAD_META_WASABI_SECRET_ACCESS_KEY}"
    }

    config {
      force_pull = true
      command    = "node"
      args       = ["/root/tidal/src/uploading.js"]
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:latest"

      auth {
        username = "rustyguts"
        password = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      }
    }

    resources {
      cpu    = 100
      memory = 128
      network {
        port "host" {}
      }
    }
  }
}
