data "archive_file" "tidal_metadata_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_metadata" {
  memory_size      = 1664
  runtime          = "provided"
  handler          = "main.handler"
  timeout          = var.lambda_timeout
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_metadata]
  source_code_hash = data.archive_file.tidal_metadata_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  file_system_config {
    local_mount_path = "/mnt/tidal"
    arn              = "arn:aws:elasticfilesystem:us-east-1:594206825329:access-point/fsap-0706d9a480f02472d"
  }

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5"
  ]

  vpc_config {
    security_group_ids = [
      "sg-665de11a",
    ]
    subnet_ids = [
      "subnet-00bcc265",
      "subnet-11635158",
      "subnet-2c4a0701",
      "subnet-c7275c9c",
      "subnet-fd3a56f1",
    ]
  }
}

resource "aws_cloudwatch_log_group" "tidal_metadata" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
