job "tidal" {
  priority    = 100
  datacenters = ["nyc3"]
  type        = "service"

  group "services" {
    count = 1
    
    update {
      max_parallel     = 1
      canary           = 1
      auto_revert      = true
      auto_promote     = true
      healthy_deadline = "5m"
      min_healthy_time = "30s"
    }

    network {
      port "bken_tidal_port" { to = 4000 }
    }

    task "tidal" {
      driver = "docker"

      template {
        data = <<EOH
DO_API_KEY="{{key "secrets/DO_API_KEY"}}"
        EOH
        
        env         = true
        destination = ".env"
      }

      template {
        env         = true
        destination = "secrets/tidal/.env"
        data        = "{{ key \"secrets/tidal/.env\" }}"
      }

      constraint {
        operator  = "regexp"
        value     = "[/tidal/]"
        attribute = "${attr.unique.hostname}"
      }

      config {
        force_pull = true
        ports      = ["bken_tidal_port"]
        image      = "registry.digitalocean.com/bken/tidal:latest"

        auth {
          username = "${DO_API_KEY}"
          password = "${DO_API_KEY}"
        }
      }

      service {
        name = "bken-tidal"
        port = "bken_tidal_port"
        tags = ["urlprefix-tidal.bken.io/"]

        check {
          path     = "/"
          timeout  = "2s"
          interval = "10s"
          type     = "http"
          name     = "bken_tidal_port alive"
        }
      }

      resources {
        memory = 300
        cpu    = 300
      }
    }
  }
}