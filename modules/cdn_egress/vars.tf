variable "env" { type = string }

variable "lambda_timeout" {
  default = 900
  type    = number
}

locals {
  queue_name          = "tidal-cdn-egress-${var.env}"
  function_name       = "tidal-cdn-egress-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
  value = aws_lambda_function.cdn_egress.arn
}