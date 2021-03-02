default: build_clean

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

nomad:
	nomad agent -dev

dev:
	cd api/ && go run main.go api

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal