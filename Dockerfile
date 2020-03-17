FROM alpine:edge

RUN apk add --update --no-cache \
  git \
  bash \
  wget \
  ffmpeg \
  aws-cli

RUN git clone https://github.com/bken-io/tidal.git
