resource "aws_sqs_queue" "tidal_concatinating" {
  visibility_timeout_seconds = var.lambda_timeout
  name                       = local.queue_name

    policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:*:*:${local.queue_name}"
    }
  ]
}
POLICY
}
