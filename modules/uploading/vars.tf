variable "env" { type = string }

locals {
  function_name       = "tidal_uploading_${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
   value = aws_lambda_function.tidal_uploading.arn
}