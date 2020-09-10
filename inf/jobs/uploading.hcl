job "uploading" {
  type        = "batch"
  datacenters = ["dc1"]
  priority    = 100

  parameterized {
    payload       = "optional"
    meta_required = [
      "s3_in",
      "script_path"
    ]
  }

  group "uploading" {
    task "uploading" {
      restart {
        attempts = 5
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 1000
      }

      driver = "raw_exec"

      config {
        command = "node"
        args    = [
          "${NOMAD_META_SCRIPT_PATH}",
          "${NOMAD_META_S3_IN}",
        ]
      }
    }

    reschedule {
      attempts       = 5
      delay          = "10s"
      max_delay      = "30m"
      unlimited      = false
      delay_function = "exponential"
    }
  }
}