terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "bken-tf-state"
    key    = "services/tidal/dev/tidal.tfstate"
  }
}

provider "aws" { region  = "us-east-1" }

module "core" {
  env       = "dev"
  namespace = "bken"
  source    = "../../modules/core"
}

module "transcoding" {
  env    = "dev"
  source = "../../modules/transcoding"
}