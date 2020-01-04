# This script is used to create a new base image

apt update
apt install -y git nodejs npm ffmpeg
npm i -g yarn
cd /root
git clone https://github.com/bken-io/video
cd video
yarn

# Environment variables are injected at runtime