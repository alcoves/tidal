bind_addr = "10.132.50.23"
data_dir  = "/var/lib/nomad"

advertise {
  http = "10.132.50.23:4646"
  rpc  = "10.132.50.23:4647"
  serf = "10.132.50.23:4648"
}

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