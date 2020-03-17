job "segmentation" {
  type        = "batch"
  datacenters = ["dc1"]

  meta {
    timecode = "00:00:00"
  }

  parameterized {
    meta_required = ["input", "timecode"]
  }

  task "segmentation" {
    driver = "raw_exec"

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "${NOMAD_META_INPUT}"
    }

    config {
      command = "segmentation.sh"
      args    = ["${NOMAD_META_INPUT}"]
    }

    resources {
      cpu    = 250
      memory = 128
    }
  }
}
