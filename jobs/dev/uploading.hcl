job "uploads_dev" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "table_name",
      "uploads_queue_url",
      "github_access_token",
      "wasabi_access_key_id",
      "transcoding_queue_url",
      "wasabi_secret_access_key",
    ]
  }

  task "uploads" {
    driver = "docker"

    env {
      TIDAL_ENV                = "dev"
      GITHUB_ACCESS_TOKEN      = "${NOMAD_META_GITHUB_ACCESS_TOKEN}"
      WASABI_ACCESS_KEY_ID     = "${NOMAD_META_WASABI_ACCESS_KEY_ID}"
      WASABI_SECRET_ACCESS_KEY = "${NOMAD_META_WASABI_SECRET_ACCESS_KEY}"
    }

    config {
      force_pull = true
      command    = "node"
      image      = "docker.pkg.github.com/bken-io/tidal/tidal:dev"
      args       = [
        "/root/tidal/src/uploading.js",
        "--tableName",
        "${NOMAD_META_TABLE_NAME}",
        "--uploadsQueueUrl",
        "${NOMAD_META_UPLOADS_QUEUE_URL}",
        "--transcodingQueueUrl",
        "${NOMAD_META_TRANSCODING_QUEUE_URL}"
      ]

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
