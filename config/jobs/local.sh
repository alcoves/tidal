#/bin/bash
# Runs consul and nomad locally

consul agent -dev &
sleep 10

consul kv put secrets/CONSUL_TOKEN "test"
consul kv put secrets/NOMAD_TOKEN "test"

nomad agent -dev