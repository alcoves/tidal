default: install

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal

api:
	go run ./main.go

ui:
	cd client && yarn start
