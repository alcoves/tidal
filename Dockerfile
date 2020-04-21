FROM alpine:edge

ARG GIT_SHA

ENV GIT_SHA=$GIT_SHA
ENV REPO_URL="https://github.com/bken-io/tidal.git"

RUN apk add --update --no-cache \
  git \
  rust \
  cargo \
  ffmpeg

WORKDIR "/root"
RUN git clone $REPO_URL

WORKDIR "/root/tidal"
RUN git reset --hard $GIT_SHA

RUN cargo build --release

CMD [ "cargo", "run" ]