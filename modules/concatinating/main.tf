data "archive_file" "tidal_concatinating_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_concatinating" {
  memory_size      = 3008
  runtime          = "provided"
  timeout          = var.lambda_timeout
  function_name    = local.function_name
  handler          = "main.handler"
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_concatinating]
  source_code_hash = data.archive_file.tidal_concatinating_zip.output_base64sha256

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
      "subnet-9446c4a8",
      "subnet-c7275c9c",
      "subnet-fd3a56f1",
    ]
  }
}

resource "aws_lambda_event_source_mapping" "tidal_concatinating" {
  batch_size       = 1
  event_source_arn = aws_sqs_queue.tidal_concatinating.arn
  function_name    = aws_lambda_function.tidal_concatinating.function_name
}

resource "aws_cloudwatch_log_group" "tidal_concatinating" {
  retention_in_days = 30
  name              = "/aws/lambda/${local.function_name}"
}
