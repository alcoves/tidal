job "segmenting_dev" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "batch"

  parameterized {
    meta_required = [
      "bucket",
      "video_id",
      "filename",
      "table_name",
      "github_access_token",
      "transcoding_queue_url",
      "wasabi_access_key_id",
      "wasabi_secret_access_key",
    ]
  }

  task "segmenting" {
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
        "/root/tidal/src/segmenting.js",
        "--bucket",
        "${NOMAD_META_BUCKET}",
        "--videoId",
        "${NOMAD_META_VIDEO_ID}",
        "--filename",
        "${NOMAD_META_FILENAME}",
        "--tableName",
        "${NOMAD_META_TABLE_NAME}",
        "--transcodingQueueUrl",
        "${NOMAD_META_TRANSCODING_QUEUE_URL}"
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
