FROM alpine:edge

COPY ./target/release/tidal tidal

RUN apk add --update --no-cache ffmpeg awscli

CMD [ "sh", "tidal" ]
