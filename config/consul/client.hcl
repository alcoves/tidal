  
client_addr = "0.0.0.0"
data_dir    = "/var/lib/consul"

client {
  enabled    = true
  retry_join = "provider=digitalocean region=nyc3 tag_name=leader api_token=DO_API_TOKEN" 
}