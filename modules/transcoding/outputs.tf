output "function_arn" {
  value = aws_lambda_function.tidal_transcoding.arn
}

output "transcoding_queue_name" {
  value = local.queue_name
}