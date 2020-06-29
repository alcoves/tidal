#!/bin/bash
set -e

# Install deps
sudo apt update
sudo apt install -y unzip docker.io

# Install nomad
wget https://releases.hashicorp.com/nomad/0.10.4/nomad_0.10.4_linux_amd64.zip
unzip nomad_0.10.4_linux_amd64.zip
rm nomad_0.10.4_linux_amd64.zip
mv nomad /usr/local/bin

# Clone tidal
git clone https://github.com/bken-io/tidal.git

# Create service definitions
sudo cp /mnt/tidal/nomad/client.service /etc/systemd/system/nomad-client.service
sudo cp /mnt/tidal/nomad/server.service /etc/systemd/system/nomad-server.service

sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service

sudo su - ubuntu
sudo apt update
sudo apt upgrade -y
sudo apt -y install ffmpeg htop unzip zip curl wget git build-essential nasm awscli jq unzip docker.io

sudo aws configure set region us-east-1 --profile default
curl "https://releases.hashicorp.com/nomad/0.11.3/nomad_0.11.3_linux_amd64.zip" -o "nomad.zip"
unzip nomad.zip
sudo mv nomad /usr/local/bin/
rm -rf nomad.zip
curl https://sh.rustup.rs -sSf | sh -s -- -y
git clone https://github.com/xiph/rav1e/ && cd rav1e
/home/ubuntu/.cargo/bin/cargo build --release && cd ..
git clone https://github.com/bken-io/tidal/ && cd tidal && git checkout dev && cd ..
