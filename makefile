default: build_clean

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal

api: install
	tidal api

run: jobs
	go run cmd/tidal.go $(ARGS)

# Nomad
jobs:
	nomad job run config/jobs/ingest.hcl