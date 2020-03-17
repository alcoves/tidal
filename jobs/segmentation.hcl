job "segmentation" {
  type        = "batch"
  datacenters = ["dc1"]
  
  parameterized {
    meta_required = ["input"]
  }

  task "segmentation" {
    driver = "raw_exec"

    artifact {
      mode        = "file"
      destination = "local/file"
      source      = "${NOMAD_META_INPUT}"
    }

    config {
      command = "/root/tidal/scripts/segmentation.sh"
      args    = ["${NOMAD_META_INPUT}"]
    }

    resources {
      cpu    = 250
      memory = 128
    }
  }
}
