default: install

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal

dev:
	go run ./main.go
