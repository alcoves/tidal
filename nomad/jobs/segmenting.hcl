job "segmenting" {
  priority    = 1
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "bucket",
      "video_id",
      "filename",
    ]
  }

  task "segmenting" {
    driver = "raw_exec"

    config {
      command = "/home/ubuntu/nonad/scripts/segmenting.sh"

      args = [
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
        "${NOMAD_META_FILENAME}",
      ]
    }
  }
}
