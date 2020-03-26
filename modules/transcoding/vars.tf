variable "env" { type = string }

locals {
  queue_name          = "tidal-transcoding-${var.env}"
  function_name       = "tidal-transcoding-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}
