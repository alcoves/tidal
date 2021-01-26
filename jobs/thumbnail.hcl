job "thumbnail" {
  priority    = 100
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "[/tidal/]"
    attribute = "${attr.unique.hostname}"
  }

  parameterized {
    payload       = "optional"
    meta_required = [
      "s3_in",
      "s3_out",
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
        cpu    = 1000
        memory = 1000
      }

      config {
        command = "/root/tidal/main"
        args    = [
          "/root/tidal/src/thumbnail.sh",
          "thumbnail",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
          "--endpoint",
          "{{key "secrets/WASABI_ENDPOINT"}}",
          "---accessKeyId",
          "{{key "secrets/WASABI_ACCESS_KEY_ID"}}"
          "--secretAccessKey",
          "{{key "secrets/WASABI_SECRET_ACCESS_KEY"}}",
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