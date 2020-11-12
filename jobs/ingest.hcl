job "ingest" {
  priority    = 90
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "[/tidal/]"
    attribute = "${attr.unique.hostname}"
  }

  parameterized {
    payload       = "optional"
    meta_required = [ "s3_in" ]
  }

  group "ingest" {
    task "ingest" {
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
        cpu    = 1000
        memory = 1000
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/ingest.sh",
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

    ephemeral_disk {
      migrate = false
      sticky  = false
      size    = "10000"
    }
  }
}