terraform {
  backend "s3" {
    bucket = "bken-tf-state"
    key    = "services/tidal/tidal.tfstate"
    region = "us-east-1"
  }
}

provider "aws" { region  = "us-east-1" }