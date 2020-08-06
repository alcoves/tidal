resource "aws_s3_bucket" "tidal" {
  acl    = "private"
  bucket = local.bucket_name

  cors_rule {
    max_age_seconds = 3000
    allowed_headers = ["*"]
    allowed_origins = ["*"]
    allowed_methods = ["PUT"]
    expose_headers  = ["ETag"]
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = 7
    enabled                                = true
    prefix                                 = "segments/"
    id                                     = "ExpireSegments"

    expiration {
      days                         = 7
      expired_object_delete_marker = false
    }

    noncurrent_version_expiration {
      days = 2
    }
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = 7
    enabled                                = true
    prefix                                 = "audio/"
    id                                     = "ExpireAudio"

    expiration {
      days                         = 7
      expired_object_delete_marker = false
    }

    noncurrent_version_expiration {
      days = 2
    }
  }
}

resource "aws_s3_bucket_notification" "tidal_s3_event_mapping" {
  bucket = aws_s3_bucket.tidal.id

  // TODO :: Add the tidal lambda notifier here
}
