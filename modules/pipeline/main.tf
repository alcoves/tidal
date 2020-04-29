variable "env" { type = string }
variable "app_image" { type = string }

data "template_file" "pipeline_conf" {
  template = file("${path.module}/pipeline.json")

  vars = {
    app_image = var.app_image
    log_group = aws_cloudwatch_log_group.pipeline.name
  }
}

resource "aws_ecs_task_definition" "pipeline" {
  cpu                      = 4096
  memory                   = 8192
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  family                   = "pipeline"
  execution_role_arn       = "arn:aws:iam::594206825329:role/ecsTaskAll"
  task_role_arn            = "arn:aws:iam::594206825329:role/ecsTaskAll"
  container_definitions    = data.template_file.pipeline_conf.rendered
}

resource "aws_cloudwatch_log_group" "pipeline" {
  name = "tidal/${var.env}/pipeline"

  tags = {
    Environment = var.env
    Application = "pipeline"
  }
}
