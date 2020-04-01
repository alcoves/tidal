nomad job dispatch -detach \
  -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
  -meta "wasabi_access_key_id=$WASABI_ACCESS_KEY_ID" \
  -meta "wasabi_secret_access_key=$WASABI_SECRET_ACCESS_KEY" \
  -meta "uploads_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev" \
  -meta "transcoding_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev" \
  -meta "table_name=tidal-dev" \
  uploads_dev

nomad job dispatch -detach \
  -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
  -meta "wasabi_access_key_id=$WASABI_ACCESS_KEY_ID" \
  -meta "wasabi_secret_access_key=$WASABI_SECRET_ACCESS_KEY" \
  -meta "uploads_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-prod" \
  -meta "transcoding_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-prod" \
  -meta "table_name=tidal-prod" \
  uploads_prod