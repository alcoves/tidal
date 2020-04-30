variable "env" { type = string }

variable "lambda_timeout" {
  default = 900
  type    = number
}

locals {
  queue_name          = "tidal-transcoding-${var.env}"
  function_name       = "tidal-transcoding-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
  value = aws_lambda_function.tidal_transcoding.arn
}

output "transcoding_queue_name" {
  value = local.queue_name
}