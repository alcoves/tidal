variable "env" {
  type = string
}

variable "namespace" {
  type = string
}

locals {
  bucket_name = "tidal-${var.namespace}-${var.env}"
}
