# This script is not meant to run headless
# Setting up a base image should be done line by line

echo "Setting environment variables"
NOMAD_VERSION="0.12.3"
CONSUL_VERSION="1.8.3"

echo "Installing dependencies"
sudo apt update && sudo apt -y install gnupg ffmpeg htop nfs-common unzip zip curl wget git build-essential nasm awscli jq docker.io

# echo "Installing mongodb"
# wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
# echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
# sudo apt update && sudo apt install -y mongodb-org

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

echo "Installing Rust"
curl https://sh.rustup.rs -sSf | sh -s -- -y

echo "Installing node"
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
sudo cp /root/tidal/inf/consul/client.service /etc/systemd/system/consul-client.service
sudo systemctl enable consul-client.service
sudo systemctl start consul-client.service

# Configure Nomad Server
sudo cp /root/tidal/inf/nomad/server.service /etc/systemd/system/nomad-server.service
sudo systemctl enable nomad-server.service
sudo systemctl start nomad-server.service

# Configure Nomad Client
sudo cp /root/tidal/inf/nomad/client.service /etc/systemd/system/nomad-client.service
sudo systemctl enable nomad-client.service
sudo systemctl start nomad-client.service

echo "setting up digitalocean profile"
aws configure set aws_access_key_id "$(consul kv get secrets/DO_ACCESS_KEY_ID | jq -r '.')" --profile digitalocean
aws configure set aws_secret_access_key "$(consul kv get secrets/DO_SECRET | jq -r '.')" --profile wasabi

echo "setting up wasabi profile"
aws configure set aws_access_key_id "$(consul kv get secrets/WASABI_ACCESS_KEY_ID | jq -r '.')" --profile wasabi
aws configure set aws_secret_access_key "$(consul kv get secrets/WASABI_SECRET_ACCESS_KEY | jq -r '.')" --profile wasabi

# Generating ACL tokens for new cluster
nomad acl bootstrap
consul acl bootstrap