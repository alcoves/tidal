resource "aws_dynamodb_table" "tidal_db" {
  stream_enabled   = true
  hash_key         = "id"
  name             = "tidal"
  billing_mode     = "PAY_PER_REQUEST"
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }
}
