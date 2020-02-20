#!/bin/bash
# This script is used to setup a tidal worker node

set -e

echo "Installing deps"
sudo apt update

echo "Installing node"
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install -y nodejs

echo "Installing yarn"
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y yarn

echo "Installing system deps"
sudo apt install -y ffmpeg curl wget htop git awscli

echo "Cloning tidal"
git clone https://github.com/bken-io/tidal.git

echo "Installing tidal deps"
yarn global add pm2
cd tidal && yarn

echo "Starting tidal"
yarn start