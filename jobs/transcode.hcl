job "transcode" {
  priority    = 95
  type        = "batch"
  datacenters = ["dc1"]

  constraint {
    operator  = "regexp"
    value     = "tidal-"
    attribute = "${attr.unique.hostname}"
  }

  parameterized {
    payload       = "optional"
    meta_required = [
      "cmd",
      "s3_in",
      "s3_out",
    ]
  }

  group "transcode" {
    task "transcode" {
      driver = "raw_exec"

      template {
        data = <<EOH
NOMAD_TOKEN="{{key "secrets/NOMAD_TOKEN"}}"
CONSUL_TOKEN="{{key "secrets/CONSUL_TOKEN"}}"

S3_IN_ENDPOINT="{{key "secrets/DO_ENDPOINT"}}"
S3_IN_ACCESS_KEY_ID="{{key "secrets/DO_ACCESS_KEY_ID"}}"
S3_IN_SECRET_ACCESS_KEY="{{key "secrets/DO_SECRET_ACCESS_KEY"}}"

S3_OUT_ENDPOINT="{{key "secrets/DO_ENDPOINT"}}"
S3_OUT_ACCESS_KEY_ID="{{key "secrets/DO_ACCESS_KEY_ID"}}"
S3_OUT_SECRET_ACCESS_KEY="{{key "secrets/DO_SECRET_ACCESS_KEY"}}"
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
        memory = 3500
      }

      config {
        command = "/root/tidal/main"
        args    = [
          "transcode",
          "${NOMAD_META_S3_IN}",
          "${NOMAD_META_S3_OUT}",
          "--cmd",
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