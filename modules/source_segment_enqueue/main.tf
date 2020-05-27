data "archive_file" "tidal_source_segment_enqueue_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_source_segment_enqueue" {
  timeout          = 10
  memory_size      = 512
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_source_segment_enqueue]
  source_code_hash = data.archive_file.tidal_source_segment_enqueue_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      TIDAL_TABLE                 = "tidal-${var.env}"
      TIDAL_TRANSCODING_QUEUE_URL = var.tidal_transcoding_queue_url
    }
  }
}

resource "aws_cloudwatch_log_group" "tidal_source_segment_enqueue" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
