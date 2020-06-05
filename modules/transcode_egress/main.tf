data "archive_file" "transcode_egress_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

data "aws_ssm_parameter" "wasabi_access_key_id" {
  name = "wasabi_access_key_id"
}

data "aws_ssm_parameter" "wasabi_secret_access_key" {
  name = "wasabi_secret_access_key"
}

resource "aws_lambda_function" "transcode_egress" {
  memory_size      = 1024
  runtime          = "provided"
  handler          = "main.handler"
  timeout          = var.lambda_timeout
  function_name    = local.function_name
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.transcode_egress]
  source_code_hash = data.archive_file.transcode_egress_zip.output_base64sha256

  // Caution! Terraform plan/applys can leak the keys 
  environment {
    variables = {
      WASABI_ACCESS_KEY_ID     = data.aws_ssm_parameter.wasabi_access_key_id.value
      WASABI_SECRET_ACCESS_KEY = data.aws_ssm_parameter.wasabi_secret_access_key.value
    }
  }

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
  ]

  // vpc_config {
  //   security_group_ids = [
  //     "sg-665de11a",
  //   ]
  //   subnet_ids = [
  //     "subnet-00bcc265",
  //     "subnet-11635158",
  //     "subnet-2c4a0701",
  //     "subnet-9446c4a8",
  //     "subnet-c7275c9c",
  //     "subnet-fd3a56f1",
  //   ]
  // }
}

resource "aws_cloudwatch_log_group" "transcode_egress" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
