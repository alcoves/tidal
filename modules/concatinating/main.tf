variable "env" { type = string }
variable "app_image" { type = string }
variable "table_name" { type = string }
variable "registry_secrets_arn" { type = string }

data "aws_secretsmanager_secret_version" "wasabi_access_key_id" {
  secret_id = "wasabi_access_key_id"
}

data "aws_secretsmanager_secret_version" "wasabi_secret_access_key" {
  secret_id = "wasabi_secret_access_key"
}

data "template_file" "concatinating_conf" {
  template = file("${path.module}/concatinating.json")

  vars = {
    tidal_env                = var.env
    app_image                = var.app_image
    table_name               = var.table_name
    credentials              = var.registry_secrets_arn
    log_group                = aws_cloudwatch_log_group.concatinating.name
    wasabi_access_key_id     = data.aws_secretsmanager_secret_version.wasabi_access_key_id.secret_string
    wasabi_secret_access_key = data.aws_secretsmanager_secret_version.wasabi_secret_access_key.secret_string
  }
}

resource "aws_ecs_task_definition" "concatinating" {
  cpu                      = 4096
  memory                   = 8192
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  family                   = "concatinating"
  execution_role_arn       = "arn:aws:iam::594206825329:role/ecsTaskAll"
  task_role_arn            = "arn:aws:iam::594206825329:role/ecsTaskAll"
  container_definitions    = data.template_file.concatinating_conf.rendered
}

resource "aws_cloudwatch_log_group" "concatinating" {
  name = "tidal/${var.env}/concatinating"

  tags = {
    Environment = var.env
    Application = "concatinating"
  }
}
