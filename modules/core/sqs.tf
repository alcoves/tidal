data "aws_iam_policy_document" "tidal_upload_queue_policy" {
  statement {
    actions   = [ "sqs:SendMessage"]
    resources = [ "arn:aws:sqs:*:*:${local.uploads_queue_name}" ]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [ "${aws_s3_bucket.tidal.arn}" ]
    }
  }
}

resource "aws_sqs_queue" "tidal_uploads" {
  visibility_timeout_seconds = 300
  name                       = local.uploads_queue_name
  policy                     = data.aws_iam_policy_document.tidal_upload_queue_policy.json
}

output "uploads_queue_arn" {
  value = aws_sqs_queue.tidal_uploads.arn
}