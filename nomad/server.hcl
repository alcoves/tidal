bind_addr = "{{ GetInterfaceIP \"ens5\" }}"
data_dir  = "/var/lib/nomad"

server {
  bootstrap_expect = 1
  enabled          = true
}

client { enabled = false }

plugin "raw_exec" {
  config {
    enabled = true
  }
}