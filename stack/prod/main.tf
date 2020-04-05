terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/dev/tidal.tfstate"
  }
}

provider "aws" { region = "us-east-1" }

variable "env" {
  type    = string
  default = "prod"
}

module "core" {
  env       = var.env
  namespace = "bken"
  source    = "../../modules/core"
}

module "uploading" {
  env               = var.env
  source            = "../../modules/uploading"
  uploads_queue_arn = module.core.uploads_queue_arn
}

module "transcoding" {
  env    = var.env
  source = "../../modules/transcoding"
}