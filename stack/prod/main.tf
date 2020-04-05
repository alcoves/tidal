terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/prod/tidal.tfstate"
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
  registry_secrets_arn  = "github_registry_login"
  source                = "../../modules/segmenting"
  table_name            = module.core.tidal_table_name
  transcoding_queue_url = "https://sqs.us-east-1.amazonaws.com/594206825329/${module.transcoding.transcoding_queue_name}" 
  app_image             = "docker.pkg.github.com/bken-io/tidal/tidal:latest"
}

module "concatinating" {
  env                   = var.env
  registry_secrets_arn  = "github_registry_login"
  source                = "../../modules/concatinating"
  table_name            = module.core.tidal_table_name
  app_image             = "docker.pkg.github.com/bken-io/tidal/tidal:latest"
}