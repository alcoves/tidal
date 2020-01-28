#!/bin/bash
# This script is used to create a new base image

# Update deps
apt update

# Install deps
apt install -y \
  software-properties-common \
  nginx \
  git \
  htop \
  vnstat \
  wget \
  curl \
  sudo \
  ffmpeg

# Install node deps
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
apt install -y nodejs
npm i -g yarn pm2

cd /root
git clone https://github.com/bken-io/video
cd video
yarn

# Download secrets and store them on disk
# .env