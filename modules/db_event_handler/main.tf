variable "env" { type = string }
variable "tidal_db_stream_arn" { type = string }

locals {
  function_name       = "tidal_db_event_handler_${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

data "archive_file" "tidal_db_event_handler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_db_event_handler" {
  timeout          = 30
  memory_size      = 256
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_db_event_handler]
  source_code_hash = data.archive_file.tidal_db_event_handler_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  vpc_config {
    security_group_ids = [
      "sg-665de11a",
    ]
    subnet_ids = [
      "subnet-c7275c9c",
    ]
  }

  environment {
    variables = {
      NODE_ENV     = "production"
      TIDAL_BUCKET = "tidal-bken-${var.env}"
      CDN_BUCKET   = "${var.env}-cdn.bken.io"
    }
  }
}

resource "aws_lambda_event_source_mapping" "tidal_db_event_handler" {
  batch_size        = 1
  starting_position = "LATEST"
  event_source_arn  = var.tidal_db_stream_arn
  function_name     = aws_lambda_function.tidal_db_event_handler.function_name
}

resource "aws_cloudwatch_log_group" "tidal_db_event_handler" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
