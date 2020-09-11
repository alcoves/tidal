job "thumbnail" {
  priority    = 100
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

  group "thumbnail" {
    task "thumbnail" {
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
        cpu    = 500
        memory = 500
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/thumbnail.sh",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
          "${NOMAD_META_CMD}"
        ]
      }
    }
  }

  reschedule {
    attempts       = 5
    delay          = "30s"
    max_delay      = "30m"
    unlimited      = false
    delay_function = "exponential"
  }
}