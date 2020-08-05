variable "env" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "subnet_1" {
 type = string
}

variable "subnet_2" {
 type = string
}

variable "subnet_3" {
 type = string
}

variable "namespace" {
  type = string
}

variable "uploading_function_arn" {
  type = string
}

variable "s3_event_handler_function_arn" {
  type = string
}

variable "tidal_bucket_name" {
  type    = string
  default = "tidal-${var.namespace}-${var.env}"
}