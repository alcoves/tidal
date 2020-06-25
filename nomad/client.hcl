  
bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

client {
  enabled = true
  servers = ["172.31.29.153:4647"]
}

reserved {
  cpu    = 500
  memory = 500
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}