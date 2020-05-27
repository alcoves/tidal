variable "env" { type = string }
variable "tidal_transcoding_queue_url" { type = string }

locals {
  function_name       = "tidal-source-segment-enqueue-${var.env}"
  archive_output_path = "${path.module}/dist/${local.function_name}.zip"
}

output "function_arn" {
  value = aws_lambda_function.tidal_source_segment_enqueue.arn
}
