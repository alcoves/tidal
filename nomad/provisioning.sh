# This script is not meant to run headless
# Setting up a base image should be done line by line

sudo su - ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt -y install ffmpeg htop nfs-common unzip zip curl wget git build-essential nasm awscli jq unzip docker.io

# Configure aws cli
sudo aws configure set region us-east-2 --profile default

# AMD64 Provisioning
NOMAD_URL="https://releases.hashicorp.com/nomad/0.11.3/nomad_0.11.3_linux_amd64.zip"

# ARM64 Provisioning
NOMAD_URL="https://releases.hashicorp.com/nomad/0.11.3/nomad_0.11.3_linux_arm64.zip"

# Install nomad
curl $NOMAD_URL -o "nomad.zip"
unzip nomad.zip
sudo mv nomad /usr/local/bin/
rm -rf nomad.zip

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install rav1e
git clone https://github.com/xiph/rav1e/ && cd rav1e
/home/ubuntu/.cargo/bin/cargo build --release && cd ..

# Clone tidal repo
git clone https://github.com/bken-io/tidal/ && cd tidal && git checkout dev && cd ..

# Nomad Leaders
sudo cp /mnt/tidal/prod/nomad/server.hcl /root/server.hcl
sudo cp /mnt/tidal/prod/nomad/server.service /etc/systemd/system/nomad-server.service
sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

# Nomad Workers
sudo cp /mnt/tidal/prod/nomad/client.hcl /root/client.hcl
sudo cp /mnt/tidal/prod/nomad/client.service /etc/systemd/system/nomad-client.service
sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service

