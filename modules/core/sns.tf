resource "aws_sns_topic" "tidal_sns_topic" {
  name = "tidal-${var.env}"
}