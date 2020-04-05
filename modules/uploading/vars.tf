variable "env" { type = string }
variable "uploads_queue_arn" { type = string }

locals {
  function_name       = "tidal-uploading-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}