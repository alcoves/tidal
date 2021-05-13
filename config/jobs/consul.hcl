job "consul" {
  priority    = 100
  datacenters = ["dc1"]
  type        = "system"

  constraint {
    operator  = "="
    value     = "amd64"
    attribute = "${attr.cpu.arch}"
  }

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
      driver = "raw_exec"
      config {
        command  = "tidal"
        args     = [ "api", "--port", "4000" ]
      }

      service {
        name = "tidal-api"
        port = "tidal_api_port"
        tags = ["urlprefix-/tidal strip=/tidal"]

        connect {
          sidecar_service {}
        }

        check {
          path     = "/"
          timeout  = "2s"
          interval = "10s"
          type     = "http"
          name     = "tidal_api_port alive"
        }
      }

      resources {
        memory = 500
        cpu    = 500
      }
    }
  }
}