  
data "archive_file" "cdn_egress_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "cdn_egress" {
  memory_size      = 1024
  runtime          = "provided"
  handler          = "main.handler"
  timeout          = var.lambda_timeout
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.cdn_egress]
  source_code_hash = data.archive_file.cdn_egress_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
  ]
}

resource "aws_cloudwatch_log_group" "cdn_egress" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}