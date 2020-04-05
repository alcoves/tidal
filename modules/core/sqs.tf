resource "aws_sqs_queue" "tidal_uploads" {
  visibility_timeout_seconds = 120
  name                       = local.uploads_queue_name

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:*:*:${local.uploads_queue_name}",
      "Condition": {
        "ArnEquals": { "aws:SourceArn": "${aws_s3_bucket.tidal.arn}" }
      }
    }
  ]
}
POLICY
}

output "uploads_queue_arn" {
  value = aws_sqs_queue.tidal_uploads.arn
}