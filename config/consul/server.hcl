client_addr =  "0.0.0.0"
data_dir    = "/var/lib/consul"

server {
  bootstrap_expect = 1
  enabled          = true
}

acl {
  enabled = true
}

client { enabled = false }