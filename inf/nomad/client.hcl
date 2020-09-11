data_dir  = "/var/lib/nomad"
bind_addr = "{{ GetInterfaceIP \"eth1\" }}"

addresses {
  http = "0.0.0.0"
}

advertise {
  http = "{{ GetInterfaceIP \"eth1\" }}"
}

client {
  enabled = true

  reserved {
    cpu    = 400
    memory = 400
  }
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}