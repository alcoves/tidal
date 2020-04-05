resource "aws_ecs_cluster" "tidal" {
  name = "tidal"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}