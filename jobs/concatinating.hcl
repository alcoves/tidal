job "concatinating" {
  priority    = 3
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    meta_required = [
      "preset",
      "bucket",
      "video_id",
    ]
  }

  task "segmenting" {
    driver = "raw_exec"

    config {
      command = "/home/ubuntu/tidal/src/concatinating.sh"

      args = [
        "${NOMAD_META_PRESET}",
        "${NOMAD_META_BUCKET}",
        "${NOMAD_META_VIDEO_ID}",
      ]
    }
  }
}
