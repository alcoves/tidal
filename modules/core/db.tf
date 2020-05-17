resource "aws_dynamodb_table" "tidal_db" {
  stream_enabled = true
  hash_key       = "id"
  range_key      = "preset"
  billing_mode   = "PAY_PER_REQUEST"
  name           = "tidal-${var.env}"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "preset"
    type = "S"
  }
}
