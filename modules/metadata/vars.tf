variable "env" { type = string }

variable "lambda_timeout" {
  default = 900
  type    = number
}

locals {
  queue_name          = "tidal-metdata-${var.env}"
  function_name       = "tidal-metdata-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "fn_name" {
  value = local.function_name
}