data_dir  = "/var/lib/nomad"
bind_addr = "{{ GetInterfaceIP \"eth1\" }}"

addresses {
  http = "0.0.0.0"
}

advertise {
  http = "{{ GetInterfaceIP \"eth1\" }}"
}

server {
  bootstrap_expect = 1
  enabled          = true
}

acl {
  enabled = true
}

client { enabled = false }

plugin "raw_exec" {
  config {
    enabled = true
  }
}