job "tidal_api" {
  priority    = 100
  datacenters = ["dc1"]
  type        = "service"

  constraint {
    operator  = "="
    value     = "amd64"
    attribute = "${attr.cpu.arch}"
  }

  group "tidal" {
    update {
      max_parallel     = 1
      canary           = 1
      auto_revert      = true
      auto_promote     = true
      healthy_deadline = "5m"
      min_healthy_time = "30s"
    }

    count = 1

    network {
      port "tidal_port" { to = 4000 }
    }

    service {
      name = "tidal_api"
      port = "tidal_port"
      tags = ["urlprefix-/tidal strip=/tidal"]

      check {
        path     = "/"
        timeout  = "2s"
        interval = "10s"
        type     = "http"
        name     = "tidal_port alive"
      }
    }

    task "tidal_api" {
      driver = "docker"

      template {
        env         = true
        destination = "secrets/.env"
        data        = "{{ key \"secrets/.env\" }}"
      }

      template {
        env         = false
        destination = "root/.config/rclone/rclone.conf"
        data        = "{{ key \"secrets/rclone.conf\" }}"
      }

      config {
        force_pull = true
        ports      = ["tidal_port"]
        image      = "registry.digitalocean.com/bken/tidal:latest"

        auth {
          username = "${DO_API_KEY}"
          password = "${DO_API_KEY}"
        }
      }

      resources {
        memory = 512
        cpu    = 512
      }
    }
  }
}