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

module "transcoding" {
  env    = var.env
  source = "../../modules/transcoding"
}

module "uploading" {
  env               = var.env
  source            = "../../modules/uploading"
  uploads_queue_arn = module.core.uploads_queue_arn
}

module "segmenting" {
  env                   = var.env
  source                = "../../modules/segmenting"
  app_image             = "594206825329.dkr.ecr.us-east-1.amazonaws.com/tidal:dev"
}

module "concatinating" {
  env                   = var.env
  source                = "../../modules/concatinating"
  app_image             = "594206825329.dkr.ecr.us-east-1.amazonaws.com/tidal:dev"
}