variable "function_name" { type = string }

locals {
  archive_output_path = "${path.module}/dist/${var.function_name}.zip"
}

data "archive_file" "seg_spawner" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_segmentation_spawner" {
  memory_size      = 512
  timeout          = 120
  runtime          = "provided"
  handler          = "spawner.handler"
  function_name    = var.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  source_code_hash = data.archive_file.seg_spawner.output_base64sha256
  depends_on       = [aws_cloudwatch_log_group.tidal_segmentation_spawner]
  layers           = ["arn:aws:lambda:us-east-1:744348701589:layer:bash:8"]
}

resource "aws_cloudwatch_log_group" "tidal_segmentation_spawner" {
  retention_in_days = 365
  name              = "/aws/lambda/${var.function_name}"
}

output "arn" {
  value = aws_lambda_function.tidal_segmentation_spawner.arn
}
