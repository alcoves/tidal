variable "env" {
  type = string
}

variable "namespace" {
  type = string
}

locals {
  uploads_queue_name = "tidal-uploads-${var.env}"
  bucket_name        = "tidal-${var.namespace}-${var.env}"
}
