default: build_clean

test:
	go test -v ./...

build_clean:
	go build cmd/tidal.go

install: build_clean
	sudo cp ./tidal /usr/local/bin/tidal

api:
	go run cmd/tidal.go api --tidalConfigDir /home/brendan/code/bkenio/tidal/

run:
	go run cmd/tidal.go $(ARGS)