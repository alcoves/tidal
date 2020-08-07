terraform {
  backend "s3" {
    region = "us-east-2"
    bucket = "bken-terraform-state"
    key    = "services/tidal/tidal.tfstate"
  }
}

provider "aws" { region = "us-east-2" }

module "core" {
  namespace = "bken"
  source    = "./core"
  vpc_name  = "bken_1"
  subnet_1  = "bken_1_a"
  subnet_2  = "bken_1_b"
  subnet_3  = "bken_1_c"
}
