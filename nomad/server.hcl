bind_addr = "0.0.0.0"
data_dir  = "/root/nomad"

server {
  bootstrap_expect = 1
  enabled          = true
}

# Turned on temporarily
client { enabled = true }

plugin "raw_exec" {
  config {
    enabled = true
  }
}