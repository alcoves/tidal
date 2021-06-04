default: install

test:
	go test -v ./...

build_clean:
	go build main.go

install: build_clean
	sudo cp ./main /usr/local/bin/tidal

api:
	go run ./main.go api --port=4000

ui:
	cd client && yarn start
