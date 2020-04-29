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
  default = "dev"
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

module "pipeline" {
  env                   = var.env
  source                = "../../modules/segmenting"
  app_image             = "594206825329.dkr.ecr.us-east-1.amazonaws.com/tidal:dev"
}