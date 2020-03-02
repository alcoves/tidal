resource "aws_s3_bucket" "tidal_bken_dev" {
  bucket = "tidal-bken-dev"
  acl    = "private"

  lifecycle_rule {
    id                                     = "ExpireAll"
    prefix                                 = ""
    enabled                                = true
    abort_incomplete_multipart_upload_days = 7

    expiration {
      days                         = 2
      expired_object_delete_marker = false
    }

    noncurrent_version_expiration {
      days = 2
    }
  }

  tags = {
    Name        = "tidal-bken-dev"
    Environment = "dev"
  }
}

resource "aws_lambda_permission" "allow_seg_lambda_access" {
  principal     = "s3.amazonaws.com"
  action        = "lambda:InvokeFunction"
  statement_id  = "AllowExecutionFromS3Bucket"
  source_arn    = aws_s3_bucket.tidal_bken_dev.arn
  function_name = module.tidal_dev_segmentation_spawner.arn
}

resource "aws_s3_bucket_notification" "tidal_bken_dev_source_upload_event" {
  bucket     = aws_s3_bucket.tidal_bken_dev.id
  depends_on = [aws_lambda_permission.allow_seg_lambda_access]

  lambda_function {
    filter_prefix       = "sources/"
    events              = ["s3:ObjectCreated:*"]
    lambda_function_arn = module.tidal_dev_segmentation_spawner.arn
  }
}

resource "aws_lambda_permission" "allow_transcode_enqueuer_access" {
  principal     = "s3.amazonaws.com"
  action        = "lambda:InvokeFunction"
  statement_id  = "AllowExecutionFromS3Bucket"
  source_arn    = aws_s3_bucket.tidal_bken_dev.arn
  function_name = module.tidal_dev_transcode_enqueuer.arn
}

resource "aws_s3_bucket_notification" "tidal_bken_dev_metadata_create_event" {
  bucket     = aws_s3_bucket.tidal_bken_dev.id
  depends_on = [aws_lambda_permission.allow_seg_lambda_access]

  lambda_function {
    filter_prefix       = "metadata/"
    events              = ["s3:ObjectCreated:*"]
    lambda_function_arn = module.tidal_dev_transcode_enqueuer.arn
  }
}
