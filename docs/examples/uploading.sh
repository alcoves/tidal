nomad job dispatch -detach \
  -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
  -meta "wasabi_access_key_id=$WASABI_ACCESS_KEY_ID" \
  -meta "wasabi_secret_access_key=$WASABI_SECRET_ACCESS_KEY" \
  uploads_dev

nomad job dispatch -detach \
  -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
  -meta "wasabi_access_key_id=$WASABI_ACCESS_KEY_ID" \
  -meta "wasabi_secret_access_key=$WASABI_SECRET_ACCESS_KEY" \
  uploads_prod