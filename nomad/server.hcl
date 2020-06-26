bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

server {
  bootstrap_expect = 1
  enabled          = true

  acl {
    enabled = true
  }
}

client { enabled = false }

plugin "raw_exec" {
  config {
    enabled = true
  }
}