data "archive_file" "tidal_uploading_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_uploading" {
  timeout          = 30
  memory_size      = 256
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_uploading]
  source_code_hash = data.archive_file.tidal_uploading_zip.output_base64sha256
}

resource "aws_lambda_event_source_mapping" "tidal_uploading" {
  batch_size       = 1
  event_source_arn = var.uploads_queue_arn
  function_name    = aws_lambda_function.tidal_uploading.function_name
}

resource "aws_cloudwatch_log_group" "tidal_uploading" {
  retention_in_days = 30
  name              = "/aws/lambda/${local.function_name}"
}
