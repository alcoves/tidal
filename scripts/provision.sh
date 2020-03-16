#!/bin/bash
set -e

if 

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

# Setup doco keys
aws --profile doco configure set aws_access_key_id $1
aws --profile doco configure set aws_secret_access_key $2

# Setup wasabo keys
aws --profile wasabi configure set aws_access_key_id $3
aws --profile wasabi configure set aws_secret_access_key $4

# Start nomad server
nomad agent -dev -bind 0.0.0.0 &