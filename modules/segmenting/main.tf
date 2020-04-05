variable "env" { type = string }
variable "app_image" { type = string }
variable "table_name" { type = string }
variable "registry_secrets_arn" { type = string }
variable "transcoding_queue_url" { type = string }

data "template_file" "segmenting_conf" {
  template = file("${path.module}/segmenting.json")

  vars = {
    app_image             = var.app_image
    table_name            = var.table_name
    credentials           = var.registry_secrets_arn
    transcoding_queue_url = var.transcoding_queue_url
    log_group             = aws_cloudwatch_log_group.segmenting.name
  }
}

resource "aws_ecs_task_definition" "segmenting" {
  cpu                      = 4096
  memory                   = 8192
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  family                   = "segmenting"
  execution_role_arn       = "arn:aws:iam::594206825329:role/ecsTaskAll"
  task_role_arn            = "arn:aws:iam::594206825329:role/ecsTaskAll"
  container_definitions    = data.template_file.segmenting_conf.rendered
}

resource "aws_cloudwatch_log_group" "segmenting" {
  name = "tidal/${var.env}/segmenting"

  tags = {
    Environment = var.env
    Application = "segmenting"
  }
}
