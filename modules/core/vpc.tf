data "aws_vpc" "bken1" {
  filter {
    name   = "tag:Name"
    values = ["bken1"]
  }
}

data "aws_subnet" "sub1" {
  filter {
    name   = "tag:Name"
    values = ["bken1_sub1"]
  }
}

data "aws_subnet" "sub2" {
  filter {
    name   = "tag:Name"
    values = ["bken1_sub2"]
  }
}

data "aws_subnet" "sub3" {
  filter {
    name   = "tag:Name"
    values = ["bken1_sub3"]
  }
}

data "aws_subnet" "sub4" {
  filter {
    name   = "tag:Name"
    values = ["bken1_sub4"]
  }
}

data "aws_subnet" "sub5" {
  filter {
    name   = "tag:Name"
    values = ["bken1_sub5"]
  }
}
