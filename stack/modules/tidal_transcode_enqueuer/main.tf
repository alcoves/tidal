variable "function_name" { type = string }

locals {
  archive_output_path = "${path.module}/dist/${var.function_name}.zip"
}

data "archive_file" "transcode_enqueuer" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_transcode_enqueuer" {
  memory_size      = 512
  timeout          = 120
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = var.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  source_code_hash = data.archive_file.transcode_enqueuer.output_base64sha256
  depends_on       = [aws_cloudwatch_log_group.tidal_transcode_enqueuer]
  layers           = ["arn:aws:lambda:us-east-1:744348701589:layer:bash:8"]

  environment {
    variables = {
      ENCODING_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/594206825329/dev-transcoding"
    }
  }
}

resource "aws_cloudwatch_log_group" "tidal_transcode_enqueuer" {
  retention_in_days = 365
  name              = "/aws/lambda/${var.function_name}"
}

output "arn" {
  value = aws_lambda_function.tidal_transcode_enqueuer.arn
}
