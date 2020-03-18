job "api" {
  type        = "batch"
  datacenters = ["dc1"]

  task "api" {
    driver = "docker"

    config {
      image      = "curlimages/curl"
      command    = "curl"

      args = [
        "${NOMAD_IP_host}:4646/v1/agent/members"
      ]
    }

    resources {
      network {
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
