data_dir  = "/root/nomad"

# the default
bind_addr = "0.0.0.0"

advertise {
  # Defaults to the first private IP address.
  // http = "1.2.3.4"
  // rpc  = "1.2.3.4"
  // serf = "1.2.3.4:5648" # non-default ports may be specified
}

server {
  enabled          = true
  bootstrap_expect = 1
}

client {
  enabled       = true
  // network_speed = 10
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}

// consul {
//   address = "1.2.3.4:8500"
// }
