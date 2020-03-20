data "archive_file" "tidal_transcoding_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_transcoding" {
  memory_size      = 3008
  timeout          = 900
  runtime          = "provided"
  handler          = "transcoding.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_transcoding]
  source_code_hash = data.archive_file.tidal_transcoding_zip.output_base64sha256

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5"
  ]
}

resource "aws_lambda_event_source_mapping" "tidal_transcoding" {
  batch_size       = 1
  event_source_arn = aws_sqs_queue.tidal_transcoding.arn
  function_name    = aws_lambda_function.tidal_transcoding.function_name
}

resource "aws_cloudwatch_log_group" "tidal_transcoding" {
  retention_in_days = 30
  name              = "/aws/lambda/${local.function_name}"
}
