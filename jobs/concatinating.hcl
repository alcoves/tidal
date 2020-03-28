job "concatinating" {
  priority    = 3
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
      "table_name"
    ]
  }

  task "segmenting" {
    driver = "raw_exec"

    config {
      command = "node"

      args = [
        "/home/ubuntu/tidal/src/concatinating.js",
        "${NOMAD_META_PRESET}",
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_TABLE_NAME}",
      ]
    }
  }
}
