job "fabio" {
  datacenters = ["dc1"]
  type        = "system"

  constraint {
    operator  = "="
    value     = "amd64"
    attribute = "${attr.cpu.arch}"
  }

  group "fabio" {
    constraint {
      operator  = "distinct_hosts"
      value     = "true"
    }

    network {
      port "lb" { static = 80 }
      port "ui" { static = 9998 }
    }

    task "fabio" {
      driver = "docker"
      config {
        network_mode = "host"
        image        = "fabiolb/fabio"
        args         = [
          "-proxy.addr",
          ":80;proto=http"
        ]
      }

      resources {
        cpu    = 100
        memory = 100
      }
    }
  }
}