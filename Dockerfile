FROM alpine:edge

ARG GIT_BRANCH

ENV GIT_BRANCH=$GIT_BRANCH
ENV REPO_URL="https://github.com/bken-io/tidal.git"

RUN apk add --update --no-cache \
  git \
  bash \
  wget \
  ffmpeg \
  aws-cli

RUN git clone --single-branch --branch $GIT_BRANCH $REPO_URL
