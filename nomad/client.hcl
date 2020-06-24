  
bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

client {
  enabled = true
  servers = ["172.31.29.153:4647"]
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}