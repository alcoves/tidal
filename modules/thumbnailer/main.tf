data "archive_file" "thumbnailer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "thumbnailer" {
  memory_size      = 3008
  runtime          = "provided"
  handler          = "main.handler"
  timeout          = var.lambda_timeout
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.thumbnailer]
  source_code_hash = data.archive_file.thumbnailer_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5",
  ]

  environment {
    variables = {
      WASABI_BUCKET = var.env == "dev" ? "dev-cdn.bken.io" : "cdn.bken.io"
    }
  }
}

resource "aws_cloudwatch_log_group" "thumbnailer" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
