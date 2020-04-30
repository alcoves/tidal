resource "aws_sqs_queue" "tidal_transcoding" {
  visibility_timeout_seconds = var.lambda_timeout
  name                       = local.queue_name
}
