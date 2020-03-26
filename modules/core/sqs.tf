resource "aws_sqs_queue" "tidal_uploads" {
  name = "tidal-uploads-${var.env}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:*:*:tidal-uploads-${var.env}",
      "Condition": {
        "ArnEquals": { "aws:SourceArn": "${aws_s3_bucket.tidal.arn}" }
      }
    }
  ]
}
POLICY
}
