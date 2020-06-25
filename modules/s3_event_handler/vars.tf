variable "env" { type = string }

locals {
  function_name       = "tidal_s3_event_handler_${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
  value = aws_lambda_function.tidal_s3_event_handler.arn
}
