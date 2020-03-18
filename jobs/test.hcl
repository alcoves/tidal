job "query" {
  type        = "batch"
  datacenters = ["dc1"]

  task "query" {
    driver = "docker"

    config {
      image      = "curlimages/curl"
      command    = "curl"

      args = [
        "http://${NOMAD_IP_host}:4646/v1/client/stats"
      ]
    }

    resources {
      network {
        # mode = "host"
        port "host" {}
      }
    }
  }
}

job "echo" {
  type        = "service"
  datacenters = ["dc1"]

  task "echo" {
    driver = "docker"

    config {
      image = "nginx:latest"
    }

    resources {
      network {
        mode  = "bridge"
        port "host" {}
      }
    }
  }
}
