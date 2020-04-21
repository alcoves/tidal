FROM alpine:edge

COPY ./target/release/tidal tidal

RUN apk add --update --no-cache ffmpeg

CMD [ "sh", "tidal" ]
