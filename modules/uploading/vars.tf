variable "env" { type = string }
variable "metadata_fn_name" { type = string }
variable "uploads_queue_arn" { type = string }
variable "segmenter_fn_name" { type = string }
variable "thumbnailer_fn_name" { type = string }
variable "audio_extractor_fn_name" { type = string }

locals {
  function_name       = "tidal-uploading-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}