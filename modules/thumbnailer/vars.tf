variable "env" { type = string }

variable "lambda_timeout" {
  default = 60
  type    = number
}

locals {
  queue_name          = "tidal-thumbnailer-${var.env}"
  function_name       = "tidal-thumbnailer-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "fn_name" {
  value = local.function_name
}

output "function_arn" {
  value = aws_lambda_function.thumbnailer.arn
}
