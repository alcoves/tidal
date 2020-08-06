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

locals {
  bucket_name = "tidal-${var.namespace}"
}