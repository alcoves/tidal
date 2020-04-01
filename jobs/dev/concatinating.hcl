job "concatinating_dev" {
  priority    = 3
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
      "table_name",
      "github_access_token",
      "wasabi_access_key_id",
      "wasabi_secret_access_key",
    ]
  }

  task "segmenting" {
    driver = "docker"

    env {
      GITHUB_ACCESS_TOKEN      = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      WASABI_ACCESS_KEY_ID     = "${NOMAD_META_WASABI_ACCESS_KEY_ID}"
      WASABI_SECRET_ACCESS_KEY = "${NOMAD_META_WASABI_SECRET_ACCESS_KEY}"
    }

    config {
      force_pull = true
      command    = "node"
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:dev"
      args       = [
        "/root/tidal/src/concatinating.js",
        "--bucket",
        "${NOMAD_META_BUCKET}",
        "--preset",
        "${NOMAD_META_PRESET}",
        "--videoId",
        "${NOMAD_META_VIDEO_ID}",
        "--tableName",
        "${NOMAD_META_TABLE_NAME}",
      ]

      auth {
        username = "rustyguts"
        password = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      }
    }

    resources {
      cpu    = 1000
      memory = 1000
      network {
        port "host" {}
      }
    }
  }
}
