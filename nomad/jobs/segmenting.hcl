job "segmenting" {
  priority    = 2
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "bucket",
      "video_id",
      "filename",
      "transcode_queue_url"
    ]
  }

  task "segmenting" {
    driver = "raw_exec"
    config {
      command = "node"
      args    = [
        "/home/ubuntu/tidal/nomad/scripts/segmenting.js",
        "${NOMAD_META_BUCKET} ${NOMAD_META_VIDEO_ID} ${NOMAD_META_FILENAME} ${NOMAD_META_TRANSCODE_QUEUE_URL}",
      ]
    }
  }
}
