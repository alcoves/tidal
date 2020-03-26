resource "aws_sqs_queue" "tidal_transcoding" {
  visibility_timeout_seconds = 900
  name                       = local.queue_name
}
