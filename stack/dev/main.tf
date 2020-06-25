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

module "s3_event_handler" {
  env    = var.env
  source = "../../modules/s3_event_handler"
}

module "db_event_handler" {
  env                 = var.env
  tidal_bucket        = module.core.tidal_bucket_name
  tidal_db_stream_arn = module.core.tidal_db_stream_arn
  source              = "../../modules/db_event_handler"
}

module "core" {
  env                           = var.env
  namespace                     = "bken"
  source                        = "../../modules/core"
  s3_event_handler_function_arn = module.s3_event_handler.function_arn
}

module "uploading" {
  env               = var.env
  source            = "../../modules/uploading"
  uploads_queue_arn = module.core.uploads_queue_arn
}