FROM alpine:edge

ARG GIT_SHA

ENV GIT_SHA=$GIT_SHA
ENV REPO_URL="https://github.com/bken-io/tidal.git"

RUN apk add --update --no-cache \
  git \
  bash \
  wget \
  ffmpeg \
  aws-cli

RUN clone $GIT_BRANCH $REPO_URL
RUN cd /tidal && git reset --hard $GIT_SHA && cd /
