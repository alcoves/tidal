data "archive_file" "tidal_uploading_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_uploading" {
  timeout          = 300
  memory_size      = 1024
  runtime          = "nodejs12.x"
  handler          = "index.handler"
  function_name    = local.function_name
  filename         = local.archive_output_path
  depends_on       = [aws_cloudwatch_log_group.tidal_uploading]
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  source_code_hash = data.archive_file.tidal_uploading_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  vpc_config {
    security_group_ids = [
      "sg-665de11a",
    ]
    subnet_ids = [
      "subnet-c7275c9c",
    ]
  }

  layers = [
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5"
  ]

  environment {
    variables = {
      FFMPEG_PATH   = "/opt/ffmpeg/ffmpeg"
      FFPROBE_PATH  = "/opt/ffmpeg/ffprobe"
      WASABI_BUCKET = "${var.env}-cdn.bken.io"
    }
  }
}

resource "aws_cloudwatch_log_group" "tidal_uploading" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
