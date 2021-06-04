job "api" {
  priority    = 100
  datacenters = ["dc1"]
  type        = "service"

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

    constraint {
      operator  = "distinct_hosts"
      value     = "true"
    }

    count = 2

    network {
      port "tidal_app_port" { static = 4000 }
    }

    task "api" {
      driver = "raw_exec"

      template {
        data = <<EOH
      NOMAD_TOKEN="{{ key "secrets/NOMAD_TOKEN" }}"
      CONSUL_TOKEN="{{ key "secrets/CONSUL_TOKEN" }}"
      EOH

        destination = "secrets/.env"
        env         = true
      }

      config {
        command  = "tidal"
        commands = [ "api" "--port", "${NOMAD_PORT}"]
      }

      service {
        name = "tidal-app"
        port = "tidal_app_port"
        tags = ["urlprefix-/tidal strip=/tidal"]

        connect {
          sidecar_service {}
        }

        check {
          path     = "/"
          timeout  = "2s"
          interval = "10s"
          type     = "http"
          name     = "tidal_app_port alive"
        }
      }

      resources {
        memory = 4000
        cpu    = 4000
      }
    }
  }
}