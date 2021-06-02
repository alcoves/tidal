FROM golang:latest AS build
WORKDIR /app
COPY . .

ENV GOOS=linux
ENV GOARCH=amd64
ENV CGO_ENABLED=0

RUN go build -o /out/tidal .

FROM alpine:latest
RUN apk add  --no-cache ffmpeg rclone
COPY --from=build /out/tidal .

EXPOSE 4000
CMD [ "/tidal" ]