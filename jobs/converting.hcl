job "converting" {
  priority    = 50
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "[/tidal/]"
    attribute = "${attr.unique.hostname}"
  }

  parameterized {
    payload       = "optional"
    meta_required = ["s3_in"]
  }

  group "converting" {
    task "converting" {
      driver = "raw_exec"

      restart {
        attempts = 3
        delay    = "10s"
      }

      resources {
        cpu    = 4000
        memory = 3000
      }

      config {
        command = "/usr/bin/bash"
        args    = [
          "/root/tidal/src/converting.sh",
          "${NOMAD_META_S3_IN}",
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

    ephemeral_disk {
      migrate = false
      sticky  = false
      size    = "10000"
    }
  }
}