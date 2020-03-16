bind_addr = "0.0.0.0"
data_dir  = "/var/lib/nomad"

server_join {
  retry_max = 5
  retry_interval = "15s"
  retry_join = [ "1.1.1.1" ]
}

client { enabled = true }

plugin "raw_exec" {
  config {
    enabled = true
  }
}