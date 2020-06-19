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

// TODO :: Interpolate
variable "tidal_concat_queue_url" {
  default = "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-concatinating-dev"
}

module "source_segment_enqueue" {
  env                         = var.env
  source                      = "../../modules/source_segment_enqueue"
  tidal_transcoding_queue_url = var.transcoding_queue_name
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

module "thumbnailer" {
  env    = var.env
  source = "../../modules/thumbnailer"
}

module "cdn_egress" {
  env    = var.env
  source = "../../modules/cdn_egress"
}

module "core" {
  env                                 = var.env
  namespace                           = "bken"
  source                              = "../../modules/core"
  concatinating_queue_arn             = module.concatinating.queue_arn
  cdn_egress_function_arn             = module.cdn_egress.function_arn
  source_segment_enqueue_function_arn = module.source_segment_enqueue.function_arn
}

module "event_handler" {
  env                         = var.env
  tidal_transcoding_queue_url = var.transcoding_queue_name
  tidal_concat_queue_url      = var.tidal_concat_queue_url
  source                      = "../../modules/event_handler"
  tidal_bucket                = module.core.tidal_bucket_name
  tidal_db_stream_arn         = module.core.tidal_db_stream_arn
}

module "uploading" {
  env                     = var.env
  metadata_fn_name        = module.metadata.fn_name
  source                  = "../../modules/uploading"
  segmenter_fn_name       = module.segmenting.fn_name
  thumbnailer_fn_name     = module.thumbnailer.fn_name
  uploads_queue_arn       = module.core.uploads_queue_arn
  audio_extractor_fn_name = module.audio_extractor.fn_name
}