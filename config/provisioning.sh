# This script is not meant to run headless
# Setting up a base image should be done line by line

echo "Setting environment variables"
NOMAD_VERSION="0.12.3"
CONSUL_VERSION="1.8.3"

echo "Installing dependencies"
sudo apt update && sudo apt -y install ffmpeg htop nfs-common unzip zip curl wget git build-essential nasm awscli jq docker.io

echo "Installing Nomad"
NOMAD_URL="https://releases.hashicorp.com/nomad/${NOMAD_VERSION}/nomad_${NOMAD_VERSION}_linux_amd64.zip"

curl $NOMAD_URL -o "nomad.zip"
unzip nomad.zip
sudo mv nomad /usr/local/bin/
rm -rf nomad.zip

echo "Installing Consul"
CONSUL_URL="https://releases.hashicorp.com/consul/${CONSUL_VERSION}/consul_${CONSUL_VERSION}_linux_amd64.zip"

curl $CONSUL_URL -o "consul.zip"
unzip consul.zip
sudo mv consul /usr/local/bin/
rm -rf consul.zip

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install nodejs
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# Clone tidal repo
git clone https://github.com/bken-io/tidal/

# Setup dirs
mkdir -p /var/lib/consul
mkdir -p /var/lib/nomad

# Configure Consul Server
sudo cp /root/tidal/config/consul/server.service /etc/systemd/system/consul-server.service
sudo systemctl enable consul-server.service
sudo systemctl start consul-server.service

# Configure Consul Client
sudo cp /root/tidal/config/consul/client.service /etc/systemd/system/consul-client.service
sudo systemctl enable consul-client.service
sudo systemctl start consul-client.service

# Configure Nomad Server
sudo cp /root/tidal/config/nomad/server.service /etc/systemd/system/nomad-server.service
sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

# Configure Nomad Client
sudo cp /root/tidal/config/nomad/client.service /etc/systemd/system/nomad-client.service
sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service