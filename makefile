default: build_clean

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

api: 

run: build_clean install
	tidal $(ARGS)

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal