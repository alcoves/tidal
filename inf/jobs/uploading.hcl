job "uploading" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]

  parameterized {
    payload       = "optional"
    meta_required = [ "s3_in" ]
  }

  group "uploading" {
    task "uploading" {
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
        attempts = 5
        delay    = "10s"
      }

      resources {
        cpu    = 2000
        memory = 1500
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/uploading.sh",
          "${NOMAD_META_S3_IN}"
        ]
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
}