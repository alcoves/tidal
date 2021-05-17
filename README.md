# Tidal

Tidal is a chunk-based video transcoding pipeline that utilizes Hashicorp Nomad and Consul to horizontally scale across hundreds of nodes.

### Local Development

Start Nomad and Consul

```
nomad agent -dev
consul agent -dev
yarn dev
```

#### Config Files

Tidal uses consul kv to store configuration parameters that control how tidal operates.

Required Keys

```
config/tidal_dir # The directory that tidal uses to process videos (this should be an NFS mount availible on each node)
config/rclone # The rclone config that tidal will use to ingress and egress video data
config/nomad_acl_token # Required when acl is enabled
config/consul_acl_token # Required when acl is enabled
```
