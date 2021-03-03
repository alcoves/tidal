job "api" {
  priority    = 100
  datacenters = ["dc1"]
  type        = "service"

  group "services" {
    update {
      max_parallel     = 1
      canary           = 1
      auto_revert      = true
      auto_promote     = true
      healthy_deadline = "5m"
      min_healthy_time = "30s"
    }

    network {
      port "tidal_api_port" { static = 4000 }
    }

    task "api" {
      constraint {
        value     = "explorer-"
        operator  = "regexp"
        attribute = "${attr.unique.hostname}"
      }

      driver = "raw_exec"

      template {
        data = <<EOH
          DO_API_KEY = "{{key "secrets/DO_API_KEY"}}"
          NOMAD_TOKEN = "{{key "secrets/NOMAD_TOKEN"}}"
          CONSUL_TOKEN = "{{key "secrets/CONSUL_TOKEN"}}"
        EOH
        
        env         = true
        destination = ".env"
      }

      config {
        command  = "tidal"
        args     = [ "api" ]
      }

      service {
        name = "tidal-api"
        port = "tidal_api_port"
        tags = ["urlprefix-/"]

        connect {
          sidecar_service {}
        }

        check {
          path     = "/"
          timeout  = "2s"
          interval = "10s"
          type     = "tcp"
          name     = "tidal_api_port alive"
        }
      }

      resources {
        memory = 100
        cpu    = 100
      }
    }
  }
}