data_dir  = "/var/lib/nomad"
bind_addr = "{{ GetInterfaceIP \"eth1\" }}"

client {
  enabled = true

  reserved {
    cpu    = 500
    memory = 500
  }
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}