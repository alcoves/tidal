data "template_file" "segmenting_conf" {
  template = file("${path.module}/templates/segmenting.json")

  vars = {
    credentials = "github_registry_login"
    log_group   =  aws_cloudwatch_log_group.segmenting.name
    app_image   = "docker.pkg.github.com/bken-io/tidal/tidal:${var.env}"
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
