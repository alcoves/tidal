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
  env                     = var.env
  source                  = "../../modules/uploading"
  uploads_queue_arn       = module.core.uploads_queue_arn
  segmenter_fn_name       = module.segmenting.fn_name
  audio_extractor_fn_name = module.audio_extractor.fn_name
}

module "segmenting" {
  env    = var.env
  source = "../../modules/segmenting"
}

module "audio_extractor" {
  env    = var.env
  source = "../../modules/audio_extractor"
}

module "transcoding" {
  env    = var.env
  source = "../../modules/transcoding"
}

module "concatinator" {
  env    = var.env
  source = "../../modules/concatinator"
}