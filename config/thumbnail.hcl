job "thumbnail" {
  priority    = 100
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "app-"
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
NOMAD_TOKEN="{{key "secrets/NOMAD_TOKEN"}}"
CONSUL_TOKEN="{{key "secrets/CONSUL_TOKEN"}}"

S3_IN_ENDPOINT="{{key "secrets/WASABI_ENDPOINT"}}"
S3_IN_ACCESS_KEY_ID="{{key "secrets/WASABI_ACCESS_KEY_ID"}}"
S3_IN_SECRET_ACCESS_KEY="{{key "secrets/WASABI_SECRET_ACCESS_KEY"}}"

S3_OUT_ENDPOINT="{{key "secrets/WASABI_ENDPOINT"}}"
S3_OUT_ACCESS_KEY_ID="{{key "secrets/WASABI_ACCESS_KEY_ID"}}"
S3_OUT_SECRET_ACCESS_KEY="{{key "secrets/WASABI_SECRET_ACCESS_KEY"}}"
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
        command = "/home/ubuntu/tidal/main"
        args    = [
          "thumbnail",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
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