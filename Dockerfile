FROM alpine:edge

RUN echo "Test Env: $TEST_ENV"
ENV TEST_ENV=$TEST_ENV
RUN echo "Test Env: $TEST_ENV"

ARG GIT_BRANCH

ENV GIT_BRANCH=$GIT_BRANCH
ENV REPO_URL="https://github.com/bken-io/tidal.git"

RUN apk add --update --no-cache \
  git \
  bash \
  wget \
  ffmpeg \
  aws-cli

RUN echo "$GIT_BRANCH"
RUN echo "$REPO_URL"
RUN git clone --single-branch --branch $GIT_BRANCH $REPO_URL
