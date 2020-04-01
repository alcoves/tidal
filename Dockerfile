FROM alpine:edge

ARG GIT_SHA

ENV GIT_SHA=$GIT_SHA
ENV REPO_URL="https://github.com/bken-io/tidal.git"

RUN echo $GIT_SHA

RUN apk add --update --no-cache \
  jq \
  git \
  npm \
  yarn \
  bash \
  curl \
  wget \
  ffmpeg \
  awscli \
  nodejs

RUN git clone $REPO_URL
RUN cd /tidal && git reset --hard $GIT_SHA
RUN yarn