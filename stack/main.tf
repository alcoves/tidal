terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/prod/tidal.tfstate"
  }
}

provider "aws" { region = "us-east-2" }

variable "env" {
  type    = string
  default = "prod"
}

module "uploading" {
  env    = var.env
  source = "../modules/uploading"
}

module "s3_event_handler" {
  env    = var.env
  source = "../modules/s3_event_handler"
}

module "db_event_handler" {
  env                 = var.env
  tidal_db_stream_arn = module.core.tidal_db_stream_arn
  source              = "../modules/db_event_handler"
}

module "core" {
  env                           = var.env
  namespace                     = "bken"
  vpc_name                      = "bken_1"
  subnet_1                      = "bken_1_a"
  subnet_2                      = "bken_1_b"
  subnet_3                      = "bken_1_c"
  source                        = "../modules/core"
  uploading_function_arn        = module.uploading.function_arn
  s3_event_handler_function_arn = module.s3_event_handler.function_arn
}
