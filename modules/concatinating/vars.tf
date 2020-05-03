variable "env" { type = string }

variable "lambda_timeout" {
  default = 900
  type    = number
}

locals {
  queue_name          = "tidal-concatinating-${var.env}"
  function_name       = "tidal-concatinating-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
  value = aws_lambda_function.tidal_concatinating.arn
}

output "queue_arn" {
  value = aws_sqs_queue.tidal_concatinating.arn
}