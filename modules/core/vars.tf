variable "env" {
  type = string
}

variable "namespace" {
  type = string
}

variable "concatinating_queue_arn" {
  type = string
}

variable "source_segment_enqueue_function_arn" {
  type = string
}

locals {
  uploads_queue_name = "tidal-uploads-${var.env}"
  bucket_name        = "tidal-${var.namespace}-${var.env}"
}
