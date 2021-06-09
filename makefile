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

publish: build_clean
	mv ./main ./tidal
	chmod +x ./tidal
	zip -r latest.zip ./tidal
	rclone copyto ./latest.zip wasabi:cdn.bken.io/releases/tidal/latest.zip
	rm -rf latest.zip tidal