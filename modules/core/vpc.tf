data "aws_vpc" "bken1" {
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

data "aws_subnet" "sub1" {
  filter {
    name   = "tag:Name"
    values = [var.subnet_1]
  }
}

data "aws_subnet" "sub2" {
  filter {
    name   = "tag:Name"
    values = [var.subnet_2]
  }
}

data "aws_subnet" "sub3" {
  filter {
    name   = "tag:Name"
    values = [var.subnet_3]
  }
}
