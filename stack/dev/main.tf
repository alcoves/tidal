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

// TODO :: Interpolate
variable "transcoding_queue_name" { 
  default = "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev"
}

module "segmenting" {
  env                         = var.env
  source                      = "../../modules/segmenting"
  tidal_transcoding_queue_url = var.transcoding_queue_name
  tidal_bucket                = module.core.tidal_bucket_name
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

module "event_handler" {
  env                         = var.env
  tidal_transcoding_queue_url = var.transcoding_queue_name
  source                      = "../../modules/event_handler"
  tidal_bucket                = module.core.tidal_bucket_name
  tidal_db_stream_arn         = module.core.tidal_db_stream_arn
}

module "uploading" {
  env                     = var.env
  metadata_fn_name        = module.metadata.fn_name
  source                  = "../../modules/uploading"
  segmenter_fn_name       = module.segmenting.fn_name
  uploads_queue_arn       = module.core.uploads_queue_arn
  audio_extractor_fn_name = module.audio_extractor.fn_name
}