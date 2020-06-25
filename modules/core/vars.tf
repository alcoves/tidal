variable "env" {
  type = string
}

variable "namespace" {
  type = string
}

variable "concatinating_queue_arn" {
  type = string
}

variable "cdn_egress_function_arn" {
  type = string
}

variable "s3_event_handler_function_arn" {
  type = string
}

locals {
  uploads_queue_name = "tidal-uploads-${var.env}"
  bucket_name        = "tidal-${var.namespace}-${var.env}"
}
