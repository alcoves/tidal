job "uploads_v2" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "env",
      "github_access_token"
    ]
  }


  task "uploads" {
    driver = "docker"

    config {
      force_pull = true
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:${NOMAD_META_ENV}"
      command    = "node"
      args       = ["/root/tidal/src/uploading.js"]

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
