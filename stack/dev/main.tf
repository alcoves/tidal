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

module "segmenting" {
  env    = var.env
  // TODO :: Cleanup these
  tidal_bucket = "tidal-bken-dev"
  tidal_transcoding_queue_url = "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev"
  source = "../../modules/segmenting"
}

module "metadata" {
  env    = var.env
  source = "../../modules/metadata"
}

module "audio_extractor" {
  env    = var.env
  source = "../../modules/audio_extractor"
}

module "transcoding" {
  env    = var.env
  source = "../../modules/transcoding"
}

module "concatinating" {
  env    = var.env
  source = "../../modules/concatinating"
}

module "transcode_egress" {
  env    = var.env
  source = "../../modules/transcode_egress"
}

module "core" {
  env                           = var.env
  namespace                     = "bken"
  source                        = "../../modules/core"
  concatinating_queue_arn       = module.concatinating.queue_arn
  transcode_egress_function_arn = module.transcode_egress.function_arn
}

module "uploading" {
  env                     = var.env
  metadata_fn_name        = module.metadata.fn_name
  source                  = "../../modules/uploading"
  segmenter_fn_name       = module.segmenting.fn_name
  uploads_queue_arn       = module.core.uploads_queue_arn
  audio_extractor_fn_name = module.audio_extractor.fn_name
}