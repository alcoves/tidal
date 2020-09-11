job "transcoding" {
  priority    = 95
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "optional"
    meta_required = [
      "cmd",
      "s3_in",
      "s3_out"
    ]
  }

  group "transcoding" {
    task "transcoding" {
      driver = "raw_exec"

      template {
        data = <<EOH
          NOMAD_TOKEN  ="{{key "secrets/NOMAD_TOKEN"}}"
          CONSUL_TOKEN ="{{key "secrets/CONSUL_TOKEN"}}"
        EOH
        
        destination = ".env"
        env         = true
      }

      restart {
        attempts = 3
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 1500
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/transcoding.sh",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
          "${NOMAD_META_CMD}",
        ]
      }
    }

    reschedule {
      attempts       = 3
      delay          = "10s"
      max_delay      = "120s"
      unlimited      = false
      delay_function = "exponential"
    }
  }
}