
#!/bin/bash
set -e

# Install deps
sudo apt update
sudo apt install -y unzip docker.io

# Install nomad
wget https://releases.hashicorp.com/nomad/0.10.4/nomad_0.10.4_linux_amd64.zip
unzip nomad_0.10.4_linux_amd64.zip
rm nomad_0.10.4_linux_amd64.zip
sudo mv nomad /usr/local/bin

# Clone tidal
git clone https://github.com/bken-io/tidal.git
cd tidal && git checkout dev && cd ~

# Create service definitions
sudo cp ~/tidal/nomad/config/client.service /etc/systemd/system/nomad-client.service
sudo cp ~/tidal/nomad/config/server.service /etc/systemd/system/nomad-server.service

sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service
