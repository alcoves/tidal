data "archive_file" "tidal_segmenter_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_segmenter" {
  timeout          = 30
  memory_size      = 3008
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_segmenter]
  source_code_hash = data.archive_file.tidal_segmenter_zip.output_base64sha256

  layers = [
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5",
  ]

  environment {
    variables = {
      NODE_ENV = "production"
    }
  }
}

resource "aws_cloudwatch_log_group" "tidal_segmenter" {
  retention_in_days = 30
  name              = "/aws/lambda/${local.function_name}"
}
