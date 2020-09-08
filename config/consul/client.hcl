  
client_addr = "0.0.0.0"
retry_join  = ["10.132.0.4"]
data_dir    = "/var/lib/consul"
bind_addr   = "{{ GetInterfaceIP \"eth1\" }}" 