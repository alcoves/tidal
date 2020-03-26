terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/tidal.tfstate"
  }
}

provider "aws" { region  = "us-east-1" }

module "core_dev" {
  env       = "dev"
  namespace = "bken"
  source    = "./modules/core"
}

module "transcoding_dev" {
  env    = "dev"
  source = "./modules/transcoding"
}