resource "aws_dynamodb_table" "tidal_db" {
  hash_key       = "id"
  range_key      = "preset"
  name           = "tidal-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "preset"
    type = "S"
  }
}