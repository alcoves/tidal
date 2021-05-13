default: build_clean

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal

dev: install nomad jobs
	tidal api

nomad:
	nomad agent -dev &

jobs:
	sleep 15
	nomad job run config/jobs/consul.hcl
	nomad job run config/jobs/ingest.hcl
	nomad job run config/jobs/thumbnail.hcl
	nomad job run config/jobs/transcode.hcl