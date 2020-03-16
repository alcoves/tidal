bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

client {
  enabled = true
  servers = ["10.132.50.23:4647", "10.17.0.8:4647"]
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}