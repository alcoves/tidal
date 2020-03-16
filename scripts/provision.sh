#!/bin/bash
set -e

# Install nodejs
sudo curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

# Install deps
sudo apt update
sudo apt install -y unzip ffmpeg awscli nodejs

# Install nodejs deps
npm i -g yarn npm

# Install nomad
wget https://releases.hashicorp.com/nomad/0.10.4/nomad_0.10.4_linux_amd64.zip
unzip nomad_0.10.4_linux_amd64.zip
rm nomad_0.10.4_linux_amd64.zip
mv nomad /usr/local/bin

# Make the data dir for nomad
mkdir /root/nomad

# Start nomad server
nomad agent -dev -bind 0.0.0.0