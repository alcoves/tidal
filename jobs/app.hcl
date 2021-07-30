job "tidal" {
  priority    = 100
  datacenters = ["dc1"]
  type        = "service"

  constraint {
    operator  = "="
    value     = "amd64"
    attribute = "${attr.cpu.arch}"
  }

  group "tidal1" {
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
      port "tidal_port" { to = 3000 }
    }

    service {
      name = "tidal"
      port = "tidal_port"
      tags = ["urlprefix-/tidal2 strip=/tidal2"]

      check {
        path     = "/"
        timeout  = "2s"
        interval = "10s"
        type     = "http"
        name     = "tidal_port alive"
      }
    }

    task "tidal" {
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