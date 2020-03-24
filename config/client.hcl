bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

# addresses {
#   http = "0.0.0.0"
#   rpc  = "{{ GetInterfaceIP \"eth1\" }}"
#   serf = "{{ GetInterfaceIP \"eth1\" }}"
# }

# advertise {
#   http = "{{ GetInterfaceIP \"eth0\" }}"
#   rpc  = "{{ GetInterfaceIP \"eth1\" }}"
#   serf = "{{ GetInterfaceIP \"eth1\" }}"
# }

client {
  enabled = true
  servers = ["172.31.74.67"]
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}
