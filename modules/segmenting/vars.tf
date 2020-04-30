variable "env" { type = string }

locals {
  function_name       = "tidal-segmenter-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "fn_name" {
  value = local.function_name
}