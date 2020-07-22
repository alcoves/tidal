resource "aws_dynamodb_table" "tidal_db" {
  stream_enabled   = true
  hash_key         = "id"
  billing_mode     = "PAY_PER_REQUEST"
  name             = "tidal-${var.env}"
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }
}
