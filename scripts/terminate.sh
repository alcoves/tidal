#!/bin/bash

echo "Terminating Server"
DROPLET_ID=$(curl -s http://169.254.169.254/metadata/v1/id)
API_KEY=$1

curl -X DELETE -H 'Content-Type: application/json' -H "Authorization: Bearer $API_KEY" "https://api.digitalocean.com/v2/droplets/$DROPLET_ID)"