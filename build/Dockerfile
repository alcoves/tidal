FROM golang:1.16-alpine as BUILDER

WORKDIR /go/src/github.com/bkenio/tidal
COPY . .
RUN go mod download
RUN go mod verify 
RUN CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -ldflags="-w -s" -a -installsuffix cgo -o tidal cmd/tidal.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/bkenio/tidal/tidal .
CMD ["./tidal"]