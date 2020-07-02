data "aws_vpc" "bken1" {
  filter {
    name   = "tag:Name"
    values = ["bken_1"]
  }
}

data "aws_subnet" "sub1" {
  filter {
    name   = "tag:Name"
    values = ["bken_1_a"]
  }
}

data "aws_subnet" "sub2" {
  filter {
    name   = "tag:Name"
    values = ["bken_1_b"]
  }
}

data "aws_subnet" "sub3" {
  filter {
    name   = "tag:Name"
    values = ["bken_1_c"]
  }
}
