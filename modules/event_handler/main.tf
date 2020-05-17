variable "env" { type = string }
variable "uploads_queue_arn" { type = string }
// variable "segmenter_fn_name" { type = string }
// variable "audio_extractor_fn_name" { type = string }

locals {
  function_name       = "tidal-stream-handler-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

data "archive_file" "tidal_stream_handler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_stream_handler" {
  timeout          = 30
  memory_size      = 256
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_stream_handler]
  source_code_hash = data.archive_file.tidal_stream_handler_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  // environment {
  //   variables = {
  //     SEGMENTER_FN_NAME       = var.segmenter_fn_name
  //     AUDIO_EXTRACTOR_FN_NAME = var.audio_extractor_fn_name
  //   }
  // }
}

resource "aws_lambda_event_source_mapping" "tidal_stream_handler" {
  batch_size       = 1
  event_source_arn = var.uploads_queue_arn
  function_name    = aws_lambda_function.tidal_stream_handler.function_name
}

resource "aws_cloudwatch_log_group" "tidal_stream_handler" {
  retention_in_days = 30
  name              = "/aws/lambda/${local.function_name}"
}
