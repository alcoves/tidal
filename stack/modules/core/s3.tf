resource "aws_s3_bucket" "tidal" {
  acl    = "private"
  bucket = local.bucket_name

  # lifecycle_rule {
  #   id                                     = "ExpireAll"
  #   prefix                                 = ""
  #   enabled                                = true
  #   abort_incomplete_multipart_upload_days = 7

  #   expiration {
  #     days                         = 14
  #     expired_object_delete_marker = false
  #   }

  #   noncurrent_version_expiration {
  #     days = 2
  #   }
  # }
}

resource "aws_s3_bucket_notification" "tidal_s3_event_mapping" {
  bucket     = aws_s3_bucket.tidal.id
  depends_on = [aws_sqs_queue.tidal_uploads]

  queue {
    filter_prefix = "uploads/"
    queue_arn     = aws_sqs_queue.tidal_uploads.arn
    events        = [
      "s3:ObjectCreated:Put",
      "s3:ObjectCreated:Copy",
      "s3:ObjectCreated:CompleteMultipartUpload",
    ]
  }
}
