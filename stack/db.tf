resource "aws_dynamodb_table" "tidal_dev" {
  hash_key     = "id"
  name         = "tidal-dev"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "tidal-dev"
    Environment = "development"
  }
}
