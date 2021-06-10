test:
	go test -v ./...

build_windows:
	GOOS=windows GOARCH=386 go build -o tidal main.go

build_darwin:
	GOOS=darwin GOARCH=amd64 go build -o tidal main.go

build_linux:
	GOOS=linux GOARCH=amd64 go build -o tidal main.go

api:
	go run ./main.go api --port=4000

ui:
	cd client && yarn start
