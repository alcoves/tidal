
#!/bin/bash
set -e

# Install deps
sudo apt update
sudo apt install -y unzip docker.io ffmpeg jq awscli

# Install nodejs
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g yarn aws-sdk
npm link aws-sdk

# Install nomad
wget https://releases.hashicorp.com/nomad/0.10.4/nomad_0.10.4_linux_amd64.zip
unzip nomad_0.10.4_linux_amd64.zip
rm nomad_0.10.4_linux_amd64.zip
sudo mv nomad /usr/local/bin

# Install consul
wget https://releases.hashicorp.com/consul/1.7.2/consul_1.7.2_linux_amd64.zip
unzip consul_1.7.2_linux_amd64.zip
rm consul_1.7.2_linux_amd64.zip
sudo mv consul /usr/local/bin

# Clone tidal
git clone https://github.com/bken-io/tidal.git
cd tidal && git checkout aws && cd ~

# Create service definitions
sudo cp ~/tidal/config/nomad/client.service /etc/systemd/system/nomad-client.service
sudo cp ~/tidal/config/nomad/server.service /etc/systemd/system/nomad-server.service
sudo cp ~/tidal/config/consul/client.service /etc/systemd/system/consul-client.service
sudo cp ~/tidal/config/consul/server.service /etc/systemd/system/consul-server.service

sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service

sudo systemctl enable consul-client.service
sudo systemctl start consul-client.service

sudo systemctl enable consul-client.service
sudo systemctl start consul-client.service
