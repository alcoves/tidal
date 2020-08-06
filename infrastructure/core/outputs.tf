output "tidal_table_name" {
  value = aws_dynamodb_table.tidal_db.name
}

output "tidal_db_stream_arn" {
  value = aws_dynamodb_table.tidal_db.stream_arn
}

output "tidal_bucket_name" {
  value = aws_s3_bucket.tidal.id
}