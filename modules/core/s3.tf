resource "aws_s3_bucket" "tidal" {
  acl    = "private"
  bucket = local.bucket_name
  policy = data.aws_iam_policy_document.tidal_bucket_policy.json

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

data "aws_iam_policy_document" "tidal_bucket_policy" {
  statement {
    actions   = [ "s3:GetObject"]
    resources = ["arn:aws:s3:::tidal-bken-dev/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_lambda_permission" "allow_s3_events" {
  principal     = "s3.amazonaws.com"
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  source_arn    = aws_s3_bucket.tidal.arn
  function_name = var.s3_event_handler_function_arn
}

resource "aws_s3_bucket_notification" "tidal_s3_event_mapping" {
  bucket     = aws_s3_bucket.tidal.id
  depends_on = [aws_sqs_queue.tidal_uploads]

  queue {
    filter_prefix = "uploads/"
    events        = ["s3:ObjectCreated:*"]
    queue_arn     = aws_sqs_queue.tidal_uploads.arn
  }

  lambda_function {
    filter_prefix       = "segments"
    events              = ["s3:ObjectCreated:*"]
    lambda_function_arn = var.s3_event_handler_function_arn
  }

  lambda_function {
    filter_prefix       = "audio"
    events              = ["s3:ObjectCreated:*"]
    lambda_function_arn = var.s3_event_handler_function_arn
  }
}
