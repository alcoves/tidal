terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/prod/tidal.tfstate"
  }
}

provider "aws" { region  = "us-east-1" }

module "core" {
  env       = "prod"
  namespace = "bken"
  source    = "../../modules/core"
}

module "transcoding" {
  env    = "prod"
  source = "../../modules/transcoding"
}