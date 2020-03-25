nomad job dispatch -detach \
  -meta "env=dev" \
  -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
  uploads_v2